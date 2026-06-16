# Image Generation Providers Reference

Complete API documentation for all image generation providers.

## Pollinations.ai

**Free, no signup required**

### API
- **URL:** `https://image.pollinations.ai/prompt/{prompt}`
- **Method:** GET (simple) or POST (advanced)

### GET URL Format
```
https://image.pollinations.ai/prompt/{encoded_prompt}?model=flux&width=1024&height=1024&seed=12345&enhance=true&nologo=true
```

### Parameters
| Param | Default | Description |
|-------|---------|-------------|
| `model` | `flux` | Model name |
| `width` | `1024` | Image width |
| `height` | `1024` | Image height |
| `seed` | random | Random seed |
| `enhance` | `true` | Enhance prompt |
| `nologo` | `true` | Remove watermark |

### Models
flux, flux-realism, flux-anime, flux-3d, flux-cablyai, flux-black-forest, kontext, nanobanana, seedream, gptimage, grok, qwen

### Rate Limits
- Anonymous: 1 request/15s
- Registered: 1 request/5s
- Paid: No limits

---

## Krea AI

**Official API, 40+ models**

### API
- **Base URL:** `https://api.krea.ai`
- **Auth:** API key (Bearer token)

### Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/images/generations` | POST | Generate image |
| `/v1/models` | GET | List models |
| `/v1/images/generations/{jobId}` | GET | Get job status |

### Request Body
```json
{
  "prompt": "A sunset",
  "model": "flux-1.1-pro",
  "width": 1024,
  "height": 1024,
  "seed": 42,
  "num_inference_steps": 20,
  "guidance_scale": 7.5
}
```

### Models
flux-1.1-pro, flux-1.1-pro-ultra, flux-dev, flux-schnell, imagen-4, imagen-4-fast, ideogram-3.0, ideogram-2.0, seedream, recraft-v3, dall-e-3, midjourney-v6

---

## Jimeng/Dreamina

**Free via reverse-engineered API**

### API
- **Base URL:** `https://jimeng.jianying.com/mweb/v1`
- **Auth:** Session cookie

### Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/aigc_draft/generate` | POST | Generate image |
| `/aigc_draft/query?task_id={id}` | GET | Check task status |

### Request Body
```json
{
  "prompt": "A sunset",
  "model_info": { "model_name": "jimeng-6" },
  "width": 1024,
  "height": 1024,
  "seed": 42,
  "style": "realistic"
}
```

### Models
jimeng-6, jimeng-5, jimeng-4.1, jimeng-4

---

## Flux (Black Forest Labs)

**Official API, Schnell is free (Apache 2.0)**

### API
- **Base URL:** `https://api.bfl.ml`
- **Auth:** X-Key header

### Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/flux-1.1-pro` | POST | Generate with 1.1 Pro |
| `/v1/flux-schnell` | POST | Generate with Schnell (free) |
| `/v1/flux-dev` | POST | Generate with Dev |
| `/v1/flux-2-pro` | POST | Generate with 2 Pro |
| `/v1/get_result?id={jobId}` | GET | Get job result |

### Request Body
```json
{
  "prompt": "A sunset",
  "width": 1024,
  "height": 1024,
  "seed": 42,
  "num_inference_steps": 20,
  "guidance": 7.5
}
```

### Ultra Mode (flux-1.1-pro-ultra)
```json
{
  "prompt": "A sunset",
  "raw": true,
  "aspect_ratio": "16:9"
}
```

### Models
flux-schnell (free), flux-1.1-pro, flux-1.1-pro-ultra, flux-dev, flux-pro, flux-2-pro, flux-2-dev, flux-2-klein

---

## Grok Imagine

**Free via anonymous sessions**

### API
- **Base URL:** `https://grok.x.ai`
- **Auth:** None (anonymous sessions)

### Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/rest/id/grok-imagine` | POST | Generate image |
| `/rest/id/` | GET | Create session |

### Request Body
```json
{
  "prompt": "A sunset",
  "width": 1024,
  "height": 1024,
  "seed": 42
}
```

### Models
grok-imagine
