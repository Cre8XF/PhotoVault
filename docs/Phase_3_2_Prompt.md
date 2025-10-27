# Phase 3.2 - AI-Powered Features Prompt

## Kontekst

Du jobber med PhotoVault med følgende AI-infrastruktur allerede på plass:

- `useAIQueue.js` hook (180 linjer) - serialized API request handling
- `utils/googleVision.js` - eksisterer, men ikke aktivert
- Firebase schema har: `aiTags`, `faces`, `category`, `enhanced`, `enhancedUrl`

## Mål

Aktiver alle AI-features: Google Vision, Picsart, OpenAI for auto-tagging, face detection, smart search, enhancement og background removal.

---

## Oppgave

### 1. Google Vision Service

Opprett `/src/services/googleVision.js`:

**API Integration:**

```javascript
const GOOGLE_VISION_API = 'https://vision.googleapis.com/v1/images:annotate';

export async function analyzeImage(imageUrl, features = ['LABEL_DETECTION', 'FACE_DETECTION', 'SAFE_SEARCH_DETECTION', 'LANDMARK_DETECTION']) {
  const response = await fetch(`${GOOGLE_VISION_API}?key=${GOOGLE_VISION_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        {
          image: { source: { imageUri: imageUrl } },
          features: features.map(f => ({ type: f, maxResults: 10 }))
        }
      ]
    })
  });

  return await response.json();
}
```

**Response Parsing:**

```javascript
export function parseVisionResponse(response) {
  return {
    labels: response.labelAnnotations?.map(l => l.description) || [],
    faces: response.faceAnnotations?.length || 0,
    faceCoordinates:
      response.faceAnnotations?.map(f => ({
        boundingPoly: f.boundingPoly,
        confidence: f.detectionConfidence,
        landmarks: f.landmarks
      })) || [],
    landmark: response.landmarkAnnotations?.[0]?.description || null,
    safeSearch: response.safeSearchAnnotation,
    dominantColors: response.imagePropertiesAnnotation?.dominantColors?.colors || []
  };
}
```

---

### 2. Picsart Service

Opprett `/src/services/picsart.js`:

**API Endpoints:**

```javascript
const PICSART_API = 'https://api.picsart.io/tools/1.0';

export async function removeBackground(imageUrl) {
  const formData = new FormData();
  formData.append('image_url', imageUrl);
  formData.append('format', 'PNG');

  const response = await fetch(`${PICSART_API}/removebg`, {
    method: 'POST',
    headers: {
      'X-Picsart-API-Key': PICSART_API_KEY
    },
    body: formData
  });

  return await response.blob();
}

export async function enhanceImage(imageUrl, enhanceType = 'auto') {
  const response = await fetch(`${PICSART_API}/effects`, {
    method: 'POST',
    headers: {
      'X-Picsart-API-Key': PICSART_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      image_url: imageUrl,
      effect_name: enhanceType // 'auto', 'vivid', 'dramatic', 'portrait'
    })
  });

  return await response.blob();
}

export async function upscaleImage(imageUrl, scaleFactor = 2) {
  const response = await fetch(`${PICSART_API}/upscale`, {
    method: 'POST',
    headers: {
      'X-Picsart-API-Key': PICSART_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      image_url: imageUrl,
      upscale_factor: scaleFactor // 2 or 4
    })
  });

  return await response.blob();
}
```

---

### 3. OpenAI Service

Opprett `/src/services/openai.js`:

**GPT-4 Vision Integration:**

```javascript
const OPENAI_API = 'https://api.openai.com/v1/chat/completions';

export async function generateImageDescription(imageUrl) {
  const response = await fetch(OPENAI_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Describe this image in 2-3 sentences. Focus on key subjects, setting, and mood.' },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ],
      max_tokens: 150
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function categorizeImage(imageUrl, existingCategories) {
  const response = await fetch(OPENAI_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Categorize this image into ONE of these categories: ${existingCategories.join(', ')}. Return only the category name.`
            },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ],
      max_tokens: 20
    })
  });

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

export async function searchPhotos(query, photoDescriptions) {
  const response = await fetch(OPENAI_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: `Given this search query: "${query}"
        
        Find matching photos from this list:
        ${photoDescriptions.map((p, i) => `${i}: ${p.aiDescription} [tags: ${p.aiTags?.join(', ')}]`).join('\n')}
        
        Return only the photo indices that match, as comma-separated numbers.`
        }
      ],
      max_tokens: 100
    })
  });

  const data = await response.json();
  return data.choices[0].message.content.split(',').map(i => parseInt(i.trim()));
}
```

---

### 4. Aktiver useAIQueue Hook

Oppdater `/src/hooks/useAIQueue.js`:

**Legg til rate limiting og batch processing:**

```javascript
export function useAIQueue() {
  const [queue, setQueue] = useState([]);
  const [processing, setProcessing] = useState(false);

  const RATE_LIMITS = {
    googleVision: { rpm: 60, concurrent: 5 },
    picsart: { rpm: 30, concurrent: 2 },
    openai: { rpm: 20, concurrent: 1 }
  };

  async function processQueue() {
    if (processing || queue.length === 0) return;

    setProcessing(true);

    const batches = {
      googleVision: [],
      picsart: [],
      openai: []
    };

    // Group by service
    queue.forEach(task => {
      batches[task.service].push(task);
    });

    // Process each service with rate limiting
    for (const [service, tasks] of Object.entries(batches)) {
      const limit = RATE_LIMITS[service];

      for (let i = 0; i < tasks.length; i += limit.concurrent) {
        const batch = tasks.slice(i, i + limit.concurrent);

        await Promise.all(batch.map(task => task.execute()));

        // Rate limit delay
        if (i + limit.concurrent < tasks.length) {
          await new Promise(r => setTimeout(r, 60000 / limit.rpm));
        }
      }
    }

    setQueue([]);
    setProcessing(false);
  }

  function addToQueue(service, photoId, task) {
    setQueue(prev => [
      ...prev,
      {
        id: `${service}-${photoId}-${Date.now()}`,
        service,
        photoId,
        execute: task,
        addedAt: Date.now()
      }
    ]);
  }

  return {
    queue,
    processing,
    queueLength: queue.length,
    addToQueue,
    processQueue
  };
}
```

---

### 5. AISettingsPage Component

Opprett `/src/pages/AISettingsPage.jsx`:

**Settings Structure:**

```javascript
const aiSettings = {
  googleVision: {
    enabled: true,
    apiKey: '',
    features: {
      labelDetection: true,
      faceDetection: true,
      landmarkDetection: true,
      safeSearch: true
    }
  },
  picsart: {
    enabled: false,
    apiKey: ''
  },
  openai: {
    enabled: false,
    apiKey: '',
    model: 'gpt-4-vision-preview'
  },
  autoProcessing: {
    onUpload: true,
    batchProcess: false
  }
};
```

**UI Sections:**

1. **API Key Management** - Input fields for hver service + test button
2. **Feature Toggles** - Checkboxes for hver AI feature
3. **Auto-Processing** - Toggle for automatic analysis on upload
4. **Queue Status** - Display current queue length + manual trigger
5. **Usage Statistics** - API calls per service (hent fra Firestore)

**Storage:** Lagre i Firestore `users/{userId}/settings/ai`

---

### 6. SmartAlbumsView Component

Opprett `/src/components/SmartAlbumsView.jsx`:

**Auto-Generated Albums:**

```javascript
const smartAlbums = [
  {
    id: 'people',
    name: 'People',
    icon: <Users />,
    filter: photo => photo.faces > 0,
    autoGenerate: true
  },
  {
    id: 'landmarks',
    name: 'Landmarks',
    icon: <MapPin />,
    filter: photo => photo.landmark !== null,
    autoGenerate: true
  },
  {
    id: 'nature',
    name: 'Nature',
    icon: <TreePine />,
    filter: photo => photo.aiTags?.some(t => ['nature', 'landscape', 'outdoor', 'mountain', 'beach'].includes(t.toLowerCase())),
    autoGenerate: true
  },
  {
    id: 'food',
    name: 'Food',
    icon: <UtensilsCrossed />,
    filter: photo => photo.aiTags?.some(t => ['food', 'meal', 'restaurant', 'cuisine'].includes(t.toLowerCase())),
    autoGenerate: true
  }
];
```

**Algorithm:**

```javascript
async function generateSmartAlbums(photos) {
  const albums = [];

  for (const template of smartAlbums) {
    const matchingPhotos = photos.filter(template.filter);

    if (matchingPhotos.length >= 5) {
      // Minimum 5 photos
      albums.push({
        ...template,
        photos: matchingPhotos,
        count: matchingPhotos.length,
        coverPhoto: matchingPhotos[0],
        createdAt: Date.now(),
        isSmartAlbum: true
      });
    }
  }

  return albums;
}
```

---

### 7. AIAnalysisPanel Component

Opprett `/src/components/AIAnalysisPanel.jsx`:

**Props:**

```javascript
{
  photo: PhotoObject,
  onClose: () => void
}
```

**Display Sections:**

```javascript
<Panel>
  {/* AI Tags */}
  <Section title="Tags">
    {photo.aiTags?.map(tag => (
      <Tag key={tag} onClick={() => searchByTag(tag)}>
        {tag}
      </Tag>
    ))}
  </Section>

  {/* Face Detection */}
  {photo.faces > 0 && (
    <Section title="People">
      <FaceCount count={photo.faces} />
      <FacePositions coordinates={photo.faceCoordinates} />
    </Section>
  )}

  {/* AI Description */}
  {photo.aiDescription && (
    <Section title="Description">
      <Text>{photo.aiDescription}</Text>
    </Section>
  )}

  {/* Location */}
  {photo.landmark && (
    <Section title="Landmark">
      <LocationCard name={photo.landmark} />
    </Section>
  )}

  {/* Colors */}
  <Section title="Colors">
    <ColorPalette colors={photo.dominantColors} />
  </Section>

  {/* Actions */}
  <Actions>
    <Button onClick={reanalyze}>Re-analyze</Button>
    <Button onClick={exportData}>Export Data</Button>
  </Actions>
</Panel>
```

---

### 8. BackgroundRemovalTool Component

Opprett `/src/components/BackgroundRemovalTool.jsx`:

**Flow:**

```javascript
function BackgroundRemovalTool({ photo, onComplete }) {
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [backgroundType, setBackgroundType] = useState('transparent');

  async function handleRemoveBackground() {
    setProcessing(true);

    // Step 1: Remove background via Picsart
    const resultBlob = await removeBackground(photo.url);

    // Step 2: Apply new background if selected
    if (backgroundType !== 'transparent') {
      // Composite with selected background
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Draw background
      ctx.fillStyle = backgroundType; // or load background image
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw foreground
      const img = await loadImage(URL.createObjectURL(resultBlob));
      ctx.drawImage(img, 0, 0);

      const finalBlob = await canvasToBlob(canvas);
      setPreview(URL.createObjectURL(finalBlob));
    } else {
      setPreview(URL.createObjectURL(resultBlob));
    }

    setProcessing(false);
  }

  async function handleSave() {
    // Upload to Firebase Storage
    const storageRef = ref(storage, `photos/${userId}/${uuid()}.png`);
    const uploadResult = await uploadBytes(storageRef, preview);
    const url = await getDownloadURL(uploadResult.ref);

    // Update Firestore
    await updateDoc(doc(db, 'photos', photo.id), {
      enhancedUrl: url,
      enhanced: true,
      backgroundRemoved: true
    });

    onComplete(url);
  }

  return (
    <Modal>
      <Preview>{preview ? <img src={preview} alt="Result" /> : <img src={photo.url} alt="Original" />}</Preview>

      <Controls>
        <Select value={backgroundType} onChange={setBackgroundType}>
          <option value="transparent">Transparent</option>
          <option value="#FFFFFF">White</option>
          <option value="#000000">Black</option>
          <option value="custom">Custom image...</option>
        </Select>

        <Button onClick={handleRemoveBackground} loading={processing}>
          Remove Background
        </Button>

        {preview && <Button onClick={handleSave}>Save</Button>}
      </Controls>
    </Modal>
  );
}
```

---

### 9. ImageEnhancementTool Component

Opprett `/src/components/ImageEnhancementTool.jsx`:

**Enhancement Presets:**

```javascript
const ENHANCEMENT_PRESETS = [
  { id: 'auto', name: 'Auto Enhance', icon: <Wand2 /> },
  { id: 'vivid', name: 'Vivid Colors', icon: <Palette /> },
  { id: 'portrait', name: 'Portrait', icon: <User /> },
  { id: 'dramatic', name: 'Dramatic', icon: <Zap /> },
  { id: 'upscale_2x', name: 'Upscale 2x', icon: <Maximize /> },
  { id: 'upscale_4x', name: 'Upscale 4x', icon: <Maximize2 /> }
];

function ImageEnhancementTool({ photo, onComplete }) {
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState(null);

  async function handleEnhance(preset) {
    setProcessing(true);
    setSelectedPreset(preset);

    let resultBlob;

    if (preset.id.startsWith('upscale')) {
      const factor = preset.id.includes('4x') ? 4 : 2;
      resultBlob = await upscaleImage(photo.url, factor);
    } else {
      resultBlob = await enhanceImage(photo.url, preset.id);
    }

    setPreview(URL.createObjectURL(resultBlob));
    setProcessing(false);
  }

  return (
    <Modal>
      <Comparison>
        <Image src={photo.url} label="Original" />
        {preview && <Image src={preview} label={selectedPreset?.name} />}
      </Comparison>

      <Presets>
        {ENHANCEMENT_PRESETS.map(preset => (
          <PresetButton key={preset.id} onClick={() => handleEnhance(preset)} active={selectedPreset?.id === preset.id} disabled={processing}>
            {preset.icon}
            {preset.name}
          </PresetButton>
        ))}
      </Presets>

      {preview && (
        <Actions>
          <Button onClick={handleSave}>Save Enhanced</Button>
          <Button variant="secondary" onClick={handleReset}>
            Reset
          </Button>
        </Actions>
      )}
    </Modal>
  );
}
```

---

### 10. Duplicate Detection

Opprett `/src/utils/duplicateDetection.js`:

**Perceptual Hash Algorithm:**

```javascript
export async function generatePerceptualHash(imageUrl) {
  const img = await loadImage(imageUrl);
  const canvas = document.createElement('canvas');
  canvas.width = 8;
  canvas.height = 8;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, 8, 8);

  const imageData = ctx.getImageData(0, 0, 8, 8);
  const pixels = imageData.data;

  // Convert to grayscale
  const grayscale = [];
  for (let i = 0; i < pixels.length; i += 4) {
    const avg = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
    grayscale.push(avg);
  }

  // Calculate average
  const average = grayscale.reduce((a, b) => a + b) / grayscale.length;

  // Generate hash
  const hash = grayscale.map(v => (v > average ? '1' : '0')).join('');
  return hash;
}

export function hammingDistance(hash1, hash2) {
  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) distance++;
  }
  return distance;
}

export function findDuplicates(photos, threshold = 5) {
  const duplicates = [];

  for (let i = 0; i < photos.length; i++) {
    for (let j = i + 1; j < photos.length; j++) {
      const distance = hammingDistance(photos[i].similarityHash, photos[j].similarityHash);

      if (distance <= threshold) {
        duplicates.push({
          photo1: photos[i],
          photo2: photos[j],
          similarity: ((64 - distance) / 64) * 100 // Percentage
        });
      }
    }
  }

  return duplicates;
}
```

**DuplicatesView Component:**

```javascript
function DuplicatesView({ onMerge }) {
  const { photos } = usePhotoData();
  const [duplicates, setDuplicates] = useState([]);

  useEffect(() => {
    const found = findDuplicates(photos);
    setDuplicates(found);
  }, [photos]);

  return (
    <Grid>
      {duplicates.map(dup => (
        <DuplicateCard key={`${dup.photo1.id}-${dup.photo2.id}`}>
          <ImagePair>
            <img src={dup.photo1.url} />
            <img src={dup.photo2.url} />
          </ImagePair>

          <Similarity>{dup.similarity.toFixed(1)}% similar</Similarity>

          <Actions>
            <Button onClick={() => onMerge(dup, 'keep_first')}>Keep Left</Button>
            <Button onClick={() => onMerge(dup, 'keep_second')}>Keep Right</Button>
            <Button variant="secondary" onClick={() => onMerge(dup, 'keep_both')}>
              Keep Both
            </Button>
          </Actions>
        </DuplicateCard>
      ))}
    </Grid>
  );
}
```

---

### 11. Smart Search Implementation

Opprett `/src/components/SmartSearchBar.jsx`:

**Natural Language Search:**

```javascript
function SmartSearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const { photos } = usePhotoData();

  async function handleSearch() {
    if (!query) return;

    setSearching(true);

    // Prepare photo descriptions for AI
    const descriptions = photos.map(p => ({
      id: p.id,
      aiDescription: p.aiDescription,
      aiTags: p.aiTags,
      category: p.category
    }));

    // Use OpenAI to find matches
    const matchIndices = await searchPhotos(query, descriptions);
    const matchedPhotos = matchIndices.map(i => photos[i]).filter(p => p !== undefined);

    setResults(matchedPhotos);
    setSearching(false);
  }

  return (
    <SearchContainer>
      <Input placeholder="Search: 'beach sunset photos' or 'pictures with my dog'" value={query} onChange={setQuery} onEnter={handleSearch} />

      <SearchButton onClick={handleSearch} loading={searching}>
        <Search /> Search
      </SearchButton>

      {results.length > 0 && (
        <Results>
          <Header>
            Found {results.length} photos matching "{query}"
          </Header>
          <PhotoGrid photos={results} />
        </Results>
      )}
    </SearchContainer>
  );
}
```

---

### 12. Upload Flow Integration

Oppdater eksisterende upload flow i `usePhotoData.js`:

```javascript
async function uploadPhoto(file, albumId) {
  // 1. Upload to Firebase Storage
  const storageRef = ref(storage, `photos/${userId}/${uuid()}.jpg`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  // 2. Create Firestore document
  const photoDoc = await addDoc(collection(db, 'photos'), {
    userId,
    url,
    albumId,
    createdAt: serverTimestamp(),
    // Placeholder for AI data
    aiTags: [],
    faces: 0,
    category: 'uncategorized',
    aiDescription: '',
    similarityHash: ''
  });

  // 3. Queue AI analysis
  const { addToQueue } = useAIQueue();

  addToQueue('googleVision', photoDoc.id, async () => {
    const analysis = await analyzeImage(url);
    const parsed = parseVisionResponse(analysis);

    await updateDoc(doc(db, 'photos', photoDoc.id), {
      aiTags: parsed.labels,
      faces: parsed.faces,
      faceCoordinates: parsed.faceCoordinates,
      landmark: parsed.landmark
    });
  });

  addToQueue('openai', photoDoc.id, async () => {
    const description = await generateImageDescription(url);
    const category = await categorizeImage(url, ['nature', 'people', 'food', 'travel', 'other']);

    await updateDoc(doc(db, 'photos', photoDoc.id), {
      aiDescription: description,
      category: category
    });
  });

  addToQueue('duplicateDetection', photoDoc.id, async () => {
    const hash = await generatePerceptualHash(url);

    await updateDoc(doc(db, 'photos', photoDoc.id), {
      similarityHash: hash
    });
  });

  return photoDoc.id;
}
```

---

### 13. Firestore Schema Updates

Oppdater `photos` collection:

```javascript
photos: {
  // ✅ Existing fields
  id: string,
  userId: string,
  url: string,
  albumId: string,
  createdAt: timestamp,
  aiTags: string[],
  faces: number,
  category: string,
  enhanced: boolean,
  enhancedUrl: string,

  // NEW fields for Phase 3.2
  faceCoordinates: [
    {
      boundingPoly: object,
      confidence: number,
      landmarks: array
    }
  ],
  aiDescription: string,
  similarityHash: string,
  landmark: string | null,
  dominantColors: [
    { color: { red, green, blue }, score: number }
  ],
  safeSearch: {
    adult: string,
    spoof: string,
    medical: string,
    violence: string
  },
  backgroundRemoved: boolean,
  processingStatus: {
    googleVision: 'pending' | 'complete' | 'error',
    openai: 'pending' | 'complete' | 'error',
    picsart: 'pending' | 'complete' | 'error'
  }
}
```

Ny collection `ai_usage`:

```javascript
ai_usage: {
  userId: string,
  service: 'googleVision' | 'picsart' | 'openai',
  endpoint: string,
  timestamp: timestamp,
  cost: number, // estimated cost
  success: boolean
}
```

---

### 14. Routes Integration

Oppdater `/src/routes/AppRoutes.jsx`:

```javascript
<Route path="/ai-settings" element={<AISettingsPage />} />
<Route path="/smart-albums" element={<SmartAlbumsView />} />
<Route path="/duplicates" element={<DuplicatesView />} />
```

---

## Testing Checklist

- [ ] Google Vision API returnerer tags og faces
- [ ] Picsart background removal fungerer
- [ ] OpenAI genererer descriptions
- [ ] Smart albums auto-genereres
- [ ] Duplicate detection finner like bilder
- [ ] Natural language search fungerer
- [ ] AI queue prosesserer serielt med rate limiting
- [ ] Enhancement tools lagrer nye versjoner
- [ ] API keys lagres sikkert i Firestore

---

## Deliverables

```
/src/services/googleVision.js
/src/services/picsart.js
/src/services/openai.js
/src/hooks/useAIQueue.js (oppdatert)
/src/pages/AISettingsPage.jsx
/src/components/SmartAlbumsView.jsx
/src/components/AIAnalysisPanel.jsx
/src/components/BackgroundRemovalTool.jsx
/src/components/ImageEnhancementTool.jsx
/src/components/SmartSearchBar.jsx
/src/components/DuplicatesView.jsx
/src/utils/duplicateDetection.js
```

---
