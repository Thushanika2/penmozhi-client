"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { getLocalizedApiError } from "@/lib/localize-api-error"
import { queryKeys } from "@/lib/query-keys"
import { useCustomTags, useTrackingCategories } from "@/hooks/use-queries"
import { createCustomTag } from "@/services/custom-tag"
import { useLanguage } from "@/providers/language-provider"

interface CustomTagManagerProps {
  trackingCategoryId: number | null
  customTagId: number | null
  onTrackingCategoryChange: (id: number | null) => void
  onCustomTagChange: (id: number | null) => void
}

export function CustomTagManager({
  trackingCategoryId,
  customTagId,
  onTrackingCategoryChange,
  onCustomTagChange,
}: CustomTagManagerProps) {
  const { t, locale } = useLanguage()
  const queryClient = useQueryClient()
  const { data: categoriesData } = useTrackingCategories()
  const { data: tagsData } = useCustomTags()
  const [newTagLabel, setNewTagLabel] = React.useState("")
  const [creating, setCreating] = React.useState(false)

  const categories = categoriesData?.tracking_categories ?? []
  const tags = tagsData?.custom_tags ?? []

  function categoryLabel(cat: { label: string; label_ta: string }) {
    return locale === "ta" ? cat.label_ta : cat.label
  }

  async function handleCreateTag() {
    if (!newTagLabel.trim()) return
    setCreating(true)
    try {
      const result = await createCustomTag({ label: newTagLabel.trim() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.customTags.list })
      onCustomTagChange(result.custom_tag.id)
      onTrackingCategoryChange(null)
      setNewTagLabel("")
      toast.success(t("customTags.created"))
    } catch (error) {
      toast.error(getLocalizedApiError(error, t))
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <div className="space-y-2">
        <Label>{t("customTags.trackingCategory")}</Label>
        <Select
          value={trackingCategoryId ?? ""}
          onChange={(e) => {
            const val = e.target.value
            onTrackingCategoryChange(val ? Number(val) : null)
            if (val) onCustomTagChange(null)
          }}
        >
          <option value="">{t("customTags.selectCategory")}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {categoryLabel(cat)} ({cat.group})
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t("customTags.customTag")}</Label>
        <Select
          value={customTagId ?? ""}
          onChange={(e) => {
            const val = e.target.value
            onCustomTagChange(val ? Number(val) : null)
            if (val) onTrackingCategoryChange(null)
          }}
        >
          <option value="">{t("customTags.selectTag")}</option>
          {tags.map((tag) => (
            <option key={tag.id} value={tag.id}>
              {tag.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder={t("customTags.newTagPlaceholder")}
          value={newTagLabel}
          onChange={(e) => setNewTagLabel(e.target.value)}
        />
        <Button type="button" variant="outline" onClick={handleCreateTag} disabled={creating}>
          {t("customTags.addTag")}
        </Button>
      </div>
    </div>
  )
}
