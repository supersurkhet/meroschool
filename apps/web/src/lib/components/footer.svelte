<script lang="ts">
import { t } from '$lib/i18n/index.js'
</script>

<footer class="border-t bg-muted/30">
	<div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 gap-8 md:grid-cols-4">
			<!-- Brand -->
			<div class="md:col-span-1">
				<div class="flex items-center gap-2 mb-3">
					<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">M</div>
					<span class="text-lg font-bold">MeroSchool</span>
				</div>
				<p class="text-sm text-muted-foreground">{$t("footer.tagline")}</p>
			</div>

			<!-- Product -->
			<div>
				<h3 class="text-sm font-semibold mb-3">{$t("footer.product")}</h3>
				<ul class="space-y-2 text-sm text-muted-foreground">
					<li><a href="/features" class="hover:text-foreground transition-colors">{$t("nav.features")}</a></li>
					<li><a href="/pricing" class="hover:text-foreground transition-colors">{$t("nav.pricing")}</a></li>
					<li><a href="/demo" class="hover:text-foreground transition-colors">{$t("nav.demo")}</a></li>
				</ul>
			</div>

			<!-- Company -->
			<div>
				<h3 class="text-sm font-semibold mb-3">{$t("footer.company")}</h3>
				<ul class="space-y-2 text-sm text-muted-foreground">
					<li><a href="/about" class="hover:text-foreground transition-colors">{$t("nav.about")}</a></li>
					<li><a href="/contact" class="hover:text-foreground transition-colors">{$t("nav.contact")}</a></li>
				</ul>
			</div>

			<!-- Legal -->
			<div>
				<h3 class="text-sm font-semibold mb-3">{$t("footer.legal")}</h3>
				<ul class="space-y-2 text-sm text-muted-foreground">
					<li><a href="/privacy" class="hover:text-foreground transition-colors">{$t("footer.privacy")}</a></li>
				</ul>
			</div>
		</div>

		<div class="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
			{$t("footer.copyright")}
		</div>
	</div>
</footer>
