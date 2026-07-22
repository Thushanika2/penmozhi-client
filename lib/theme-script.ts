export const THEME_STORAGE_KEY = "theme"

/** Inline script for root layout — runs before paint to avoid theme flash. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var d=window.matchMedia("(prefers-color-scheme: dark)").matches;var r=t==="dark"||((t==="system"||!t)&&d)?"dark":"light";var e=document.documentElement;e.classList.remove("light","dark");e.classList.add(r);e.style.colorScheme=r}catch(n){}})();`
