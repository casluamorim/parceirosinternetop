# Architecture rules
- Public homepage copy uses stable, explicitly annotated field IDs and site_settings.site_content; render plain text through React so editing cannot introduce scripts or overwrite product records.
- The admin site editor embeds the real homepage and exchanges drafts only with its same-origin iframe; enable selection only after verifying the current user's protected admin role.
- Product, coverage and testimonial records remain in their existing management screens; editor selections navigate to those screens to preserve the single source of truth.
- Favicon uploads generate square PNG variants in site-assets and store their URLs in site_settings; preserve bundled icons as fallbacks.