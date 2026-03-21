<script lang="ts">
import Badge from '$lib/components/ui/badge.svelte'
import { t } from '$lib/i18n/index.js'
</script>

<svelte:head>
	<title>Privacy Policy — MeroSchool</title>
	<meta name="description" content="MeroSchool privacy policy. Learn how we protect your data and student information." />
</svelte:head>

<section class="py-20 sm:py-28">
	<div class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
		<div class="mb-12">
			<Badge variant="accent" class="mb-4">Legal</Badge>
			<h1 class="text-3xl font-bold sm:text-4xl">{$t("privacy.title")}</h1>
			<p class="mt-2 text-sm text-muted-foreground">{$t("privacy.updated")}</p>
		</div>

		<div class="prose prose-neutral dark:prose-invert max-w-none space-y-8">
			<section>
				<h2 class="text-xl font-semibold mb-3">1. Information We Collect</h2>
				<p class="text-muted-foreground leading-relaxed">We collect information necessary to provide school management services, including: school registration details, administrator contact information, student enrollment data, academic records, attendance records, and fee payment information. All data is collected with the consent of the school administration.</p>
			</section>

			<section>
				<h2 class="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
				<p class="text-muted-foreground leading-relaxed">Your information is used to: provide and maintain the MeroSchool platform, send notifications to parents and teachers, generate academic reports, process fee payments, and improve our services. We never sell personal data to third parties.</p>
			</section>

			<section>
				<h2 class="text-xl font-semibold mb-3">3. Data Security</h2>
				<p class="text-muted-foreground leading-relaxed">We implement industry-standard security measures including encryption in transit (TLS) and at rest, regular security audits, access controls, and secure data centers. Student data is treated with the highest level of care and protection.</p>
			</section>

			<section>
				<h2 class="text-xl font-semibold mb-3">4. Data Retention</h2>
				<p class="text-muted-foreground leading-relaxed">School data is retained for the duration of the subscription and up to 1 year after account closure. Schools may request complete data export or deletion at any time by contacting our support team.</p>
			</section>

			<section>
				<h2 class="text-xl font-semibold mb-3">5. Children's Privacy</h2>
				<p class="text-muted-foreground leading-relaxed">MeroSchool is a school management tool operated by educational institutions. Student data is managed by schools under their own privacy policies. We process this data solely on behalf of schools and do not use student data for advertising or marketing purposes.</p>
			</section>

			<section>
				<h2 class="text-xl font-semibold mb-3">6. Contact</h2>
				<p class="text-muted-foreground leading-relaxed">For privacy-related questions, contact us at privacy@meroschool.com or visit our office at Putalisadak, Kathmandu, Nepal.</p>
			</section>
		</div>
	</div>
</section>
