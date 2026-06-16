export default {
  "id": "comfyui",
  "priority": 120,
  "alias": "comfyui",
  "display": {
    "name": "ComfyUI",
    "icon": "account_tree",
    "color": "#4CAF50",
    "textIcon": "CF",
    "website": "https://github.com/comfyanonymous/ComfyUI"
  },
  "category": "apikey",
  "transport": null,
  "models": [
    {
      "id": "flux-dev",
      "name": "FLUX Dev",
      "params": [
        "n",
        "size"
      ],
      "kind": "image",
      "capabilities": [
        "text",
        "tools"
      ]
    },
    {
      "id": "sdxl",
      "name": "SDXL",
      "params": [
        "n",
        "size"
      ],
      "kind": "image",
      "capabilities": [
        "text",
        "tools"
      ]
    }
  ],
  "serviceKinds": [
    "image"
  ],
  "imageConfig": {
    "baseUrl": "http://localhost:8188"
  }
};
