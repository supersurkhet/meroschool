<script lang="ts">
import { Badge } from '$lib/components/ui/badge'
import { Button } from '$lib/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card'
import { api, convexQuery, isConvexConfigured } from '$lib/convex'
import { t } from '$lib/i18n/index.svelte'
import { getSchool } from '$lib/stores/school.svelte'
import { ChevronLeft, Download, Printer, QrCode } from 'lucide-svelte'
import QRCodeLib from 'qrcode'

interface Section {
	name: string
	id: string
}

interface SchoolClass {
	id: string
	name: string
	sections: Section[]
	color: string
}

let classes = $state<SchoolClass[]>([])

let selectedClass = $state<SchoolClass | null>(null)
let selectedSection = $state<Section | null>(null)

// QR code data URLs keyed by "classId/sectionId"
let qrDataUrls = $state<Record<string, string>>({})

// Generate QR code for a class+section combination
async function generateQR(cls: SchoolClass, sec: Section): Promise<string> {
	const key = `${cls.id}/${sec.id}`
	if (qrDataUrls[key]) return qrDataUrls[key]

	const data = `meroschool://class/${cls.id}/${sec.name}`
	try {
		const url = await QRCodeLib.toDataURL(data, {
			width: 300,
			margin: 2,
			color: { dark: '#000000', light: '#ffffff' },
		})
		qrDataUrls[key] = url
		return url
	} catch {
		return ''
	}
}

// Thumbnail QR URLs for the grid view (smaller)
let thumbUrls = $state<Record<string, string>>({})

async function generateThumb(cls: SchoolClass, sec: Section): Promise<string> {
	const key = `thumb-${cls.id}/${sec.id}`
	if (thumbUrls[key]) return thumbUrls[key]

	const data = `meroschool://class/${cls.id}/${sec.name}`
	try {
		const url = await QRCodeLib.toDataURL(data, {
			width: 120,
			margin: 1,
			color: { dark: '#000000', light: '#ffffff' },
		})
		thumbUrls[key] = url
		return url
	} catch {
		return ''
	}
}

// Reactive: when class/section is selected, generate the QR
let currentQrUrl = $state('')
let isGenerating = $state(false)

$effect(() => {
	if (selectedClass && selectedSection) {
		isGenerating = true
		generateQR(selectedClass, selectedSection).then((url) => {
			currentQrUrl = url
			isGenerating = false
		})
	} else {
		currentQrUrl = ''
	}
})

// Thumbnail loading — trigger for all classes on mount
let thumbsReady = $state(false)
$effect(() => {
	const tasks: Promise<void>[] = []
	for (const cls of classes) {
		for (const sec of cls.sections) {
			tasks.push(
				generateThumb(cls, sec).then(() => {
					// trigger reactivity by reassigning the whole object
					thumbUrls = { ...thumbUrls }
				}),
			)
		}
	}
	Promise.all(tasks).then(() => {
		thumbsReady = true
	})
})

function selectClass(cls: SchoolClass) {
	selectedClass = cls
	selectedSection = cls.sections[0] ?? null
}

function goBack() {
	selectedClass = null
	selectedSection = null
	currentQrUrl = ''
}

function downloadQR() {
	if (!currentQrUrl || !selectedClass || !selectedSection) return
	const a = document.createElement('a')
	a.href = currentQrUrl
	a.download = `qr-${selectedClass.name}-${selectedSection.name}.png`.replace(/\s+/g, '-')
	a.click()
}

function downloadAll() {
	for (const cls of classes) {
		for (const sec of cls.sections) {
			const key = `${cls.id}/${sec.id}`
			const url = qrDataUrls[key]
			if (url) {
				const a = document.createElement('a')
				a.href = url
				a.download = `qr-${cls.name}-${sec.name}.png`.replace(/\s+/g, '-')
				a.click()
			}
		}
	}
}

function printQR() {
	if (!currentQrUrl) return
	const win = window.open('', '_blank')
	if (!win) return
	win.document.write(`
      <html><head><title>QR Code - ${selectedClass?.name} ${selectedSection?.name}</title></head>
      <body style="display:flex;flex-direction:column;align-items:center;padding:40px;font-family:sans-serif">
        <h2 style="margin-bottom:8px">${selectedClass?.name} — ${selectedSection?.name}</h2>
        <p style="color:#666;margin-bottom:24px">Scan to join the class</p>
        <img src="${currentQrUrl}" style="width:280px;height:280px" />
        <p style="margin-top:16px;font-size:12px;color:#999">meroschool://class/${selectedClass?.id}/${selectedSection?.name}</p>
      </body></html>
    `)
	win.document.close()
	win.print()
}

const firstThumbKey = (cls: SchoolClass) => `thumb-${cls.id}/${cls.sections[0]?.id}`

// ── Convex: load real class/section hierarchy on mount ───────────────────────
// Colour palette cycled for classes that come from Convex
const CLASS_COLORS = [
	'bg-purple-500',
	'bg-blue-500',
	'bg-cyan-500',
	'bg-teal-500',
	'bg-green-500',
	'bg-yellow-500',
	'bg-orange-500',
	'bg-pink-500',
	'bg-rose-500',
	'bg-indigo-500',
]

$effect(() => {
	if (!isConvexConfigured()) return
	const schoolId = getSchool()?.id
	if (!schoolId) return

	;(async () => {
		const hierarchy = await convexQuery(api.schools.getSchoolHierarchy, { schoolId }, null as any)

		if (!hierarchy?.classes?.length) return

		const realClasses: SchoolClass[] = hierarchy.classes.map((cls: any, idx: number) => ({
			id: cls._id ?? cls.id,
			name: cls.name,
			color: CLASS_COLORS[idx % CLASS_COLORS.length],
			sections: (cls.sections ?? []).map((sec: any) => ({
				id: sec._id ?? sec.id,
				name: sec.name,
			})),
		}))

		classes = realClasses

		// Reset selection state since IDs changed
		selectedClass = null
		selectedSection = null
		currentQrUrl = ''
		qrDataUrls = {}
		thumbUrls = {}
	})()
})
</script>

<div class="flex flex-col gap-6 p-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-3">
      {#if selectedClass}
        <Button
          onclick={goBack}
          class="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft class="h-4 w-4" />
          {t('qr.allClasses')}
        </Button>
        <span class="text-muted-foreground">/</span>
        <h1 class="text-2xl font-bold tracking-tight">{selectedClass.name}</h1>
      {:else}
        <QrCode class="h-6 w-6 text-primary" />
        <h1 class="text-2xl font-bold tracking-tight">{t('qr.classQr')}</h1>
      {/if}
    </div>
    {#if !selectedClass}
      <Button onclick={downloadAll} variant="outline" size="sm">
        <Download />
        {t('qr.downloadAll')}
      </Button>
    {/if}
  </div>

  {#if selectedClass}
    <!-- ── Detail view for selected class ── -->
    <div class="grid grid-cols-3 gap-6">
      <!-- Left: QR Display -->
      <div class="col-span-2">
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle>{t('qr.classQr')} — {selectedClass.name}</CardTitle>
              <div class="flex gap-2">
                <Button onclick={downloadQR} variant="outline" size="sm">
                  <Download />
                  {t('qr.download')}
                </Button>
                <Button onclick={printQR} variant="outline" size="sm">
                  <Printer />
                  {t('qr.print')}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent class="flex flex-col items-center gap-6 pb-8">
            <!-- Section tabs -->
            {#if selectedClass.sections.length > 1}
              <div class="flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
                {#each selectedClass.sections as sec}
                  <Button
                    onclick={() => (selectedSection = sec)}
                    class="rounded-md px-4 py-1.5 text-sm font-medium transition-colors {selectedSection?.id === sec.id
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'}"
                  >
                    {sec.name}
                  </Button>
                {/each}
              </div>
            {/if}

            <!-- QR Code Image -->
            <div class="flex flex-col items-center gap-4">
              {#if isGenerating}
                <div class="flex h-64 w-64 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20">
                  <div class="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              {:else if currentQrUrl}
                <div class="rounded-xl border-4 border-foreground/10 shadow-lg overflow-hidden">
                  <img src={currentQrUrl} alt="QR Code" class="h-64 w-64" />
                </div>
              {/if}

              {#if selectedSection}
                <div class="text-center">
                  <p class="text-base font-semibold">
                    {t('qr.scanToJoin')} {selectedClass.name} — {selectedSection.name}
                  </p>
                  <p class="mt-1 font-mono text-xs text-muted-foreground">
                    meroschool://class/{selectedClass.id}/{selectedSection.name}
                  </p>
                </div>
              {/if}
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Right: All sections summary -->
      <div class="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle class="text-base">Sections</CardTitle>
          </CardHeader>
          <CardContent class="flex flex-col gap-3">
            {#each selectedClass.sections as sec}
              {@const key = `thumb-${selectedClass.id}/${sec.id}`}
              <Button
                onclick={() => (selectedSection = sec)}
                class="flex items-center gap-3 rounded-lg border p-3 text-left transition-all {selectedSection?.id === sec.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'}"
              >
                {#if thumbUrls[key]}
                  <img src={thumbUrls[key]} alt="QR" class="h-12 w-12 rounded" />
                {:else}
                  <div class="flex h-12 w-12 items-center justify-center rounded bg-muted">
                    <QrCode class="h-6 w-6 text-muted-foreground" />
                  </div>
                {/if}
                <div>
                  <p class="font-medium">{sec.name}</p>
                  <p class="text-xs text-muted-foreground">{selectedClass.name}</p>
                </div>
              </Button>
            {/each}
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-4">
            <p class="text-xs text-muted-foreground leading-relaxed">
              {t('qr.shareQr')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>

  {:else}
    <!-- ── Grid view: all classes ── -->
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {#each classes as cls}
        <Card
          class="cursor-pointer transition-all hover:border-primary/50 hover:shadow-md"
          onclick={() => selectClass(cls)}
        >
          <CardContent class="flex flex-col items-center gap-3 p-5">
            <!-- Color pill -->
            <div class="flex items-center justify-between w-full">
              <span class="inline-flex items-center gap-2">
                <span class="h-3 w-3 rounded-full {cls.color}"></span>
                <span class="font-semibold">{cls.name}</span>
              </span>
              <Badge variant="outline">{cls.sections.length} sec</Badge>
            </div>

            <!-- QR thumbnail for first section -->
            {#if thumbUrls[firstThumbKey(cls)]}
              <img
                src={thumbUrls[firstThumbKey(cls)]}
                alt="QR for {cls.name}"
                class="h-24 w-24 rounded-lg border border-border"
              />
            {:else}
              <div class="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20">
                <QrCode class="h-10 w-10 text-muted-foreground/40" />
              </div>
            {/if}

            <p class="text-xs text-muted-foreground">
              {cls.sections.map((s) => s.name).join(', ')}
            </p>
          </CardContent>
        </Card>
      {/each}
      {#if classes.length === 0}
        <div class="col-span-full flex flex-col items-center gap-2 py-12 text-muted-foreground">
          <p class="text-sm">No classes found. Complete school setup first.</p>
        </div>
      {/if}
    </div>
  {/if}
</div>
