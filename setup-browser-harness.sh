#!/bin/bash
# Browser Harness Setup for Image Generation
# This script sets up browser-harness and generates an image

set -e

echo "🎨 Browser Harness Image Generation Setup"
echo "=========================================="

# Check for BROWSER_USE_API_KEY
if [ -z "$BROWSER_USE_API_KEY" ]; then
  echo ""
  echo "❌ BROWSER_USE_API_KEY not set!"
  echo ""
  echo "To generate images, you need a Browser Use API key:"
  echo "1. Visit https://cloud.browser-use.com/new-api-key"
  echo "2. Sign up for free tier (3 concurrent browsers)"
  echo "3. Set the key: export BROWSER_USE_API_KEY=your-key-here"
  echo ""
  echo "Or run with local Chrome:"
  echo "1. Install Chromium: sudo apt-get install -y chromium-browser"
  echo "2. Launch: chromium-browser --remote-debugging-port=9222"
  echo ""
  exit 1
fi

echo "✅ BROWSER_USE_API_KEY is set"

# Check browser-harness
if ! command -v browser-harness &> /dev/null; then
  echo "Installing browser-harness..."
  uv tool install browser-harness
fi

echo "✅ browser-harness installed: $(browser-harness --version)"

# Generate image script
echo ""
echo "🖼️  Starting image generation..."
echo "A browser window will open - follow the prompts."
echo ""

browser-harness <<'PY'
import time

# Start remote browser
print("Starting remote browser...")
daemon = start_remote_daemon("image-gen", timeout=300)
print(f"Browser URL: {daemon}")

# Navigate to ChatGPT
print("Navigating to ChatGPT...")
new_tab("https://chatgpt.com")
wait_for_load()
time.sleep(3)

# Screenshot initial state
capture_screenshot("/tmp/chatgpt-1.png")
print("📸 Screenshot saved: /tmp/chatgpt-1.png")

# Check page state
info = page_info()
print(f"Page: {info[:200]}...")

# If not logged in, prompt user
if "Log in" in info or "Sign up" in info:
    print("\n⚠️  Please log in to ChatGPT in the browser window.")
    print("The browser URL should be visible in your default browser.")
    input("Press Enter here when logged in...")
    wait_for_load()
    time.sleep(3)

# Type image prompt
print("\nTyping image prompt...")
prompt = "A serene Japanese garden with a red bridge over a koi pond, cherry blossoms falling, golden hour lighting, photorealistic, 4k"

js(f"""
    const input = document.querySelector('textarea, [contenteditable="true"], #prompt-textarea');
    if (input) {{
        input.focus();
        input.value = "{prompt}";
        input.dispatchEvent(new Event('input', {{ bubbles: true }}));
        return "Input filled";
    }}
    return "Input not found";
""")

time.sleep(1)
capture_screenshot("/tmp/chatgpt-2.png")
print("📸 Screenshot saved: /tmp/chatgpt-2.png")

# Click send button
print("Sending prompt...")
js("""
    const sendBtn = document.querySelector('button[data-testid="send-button"], button[aria-label="Send prompt"]');
    if (sendBtn) {
        sendBtn.click();
        return "Clicked send";
    }
    return "Send button not found";
""")

# Wait for generation
print("Waiting for image generation (up to 60 seconds)...")
for i in range(12):
    time.sleep(5)
    capture_screenshot(f"/tmp/chatgpt-wait-{i}.png")

    # Check for generated image
    result = js("""
        const imgs = document.querySelectorAll('img[src*="dalle"], img[src*="blob"], img[alt*="Generated"], img[alt*="generated"]');
        for (const img of imgs) {
            if (img.src && !img.src.includes('avatar')) {
                return img.src;
            }
        }
        return null;
    """)

    if result:
        print(f"\n✅ Image found: {result[:100]}...")
        # Download image
        img_data = http_get(result)
        with open("./generated-image.png", "wb") as f:
            f.write(img_data)
        print("📸 Image saved to: generated-image.png")
        break
else:
    print("\n⏳ Taking final screenshot...")
    capture_screenshot("/tmp/chatgpt-final.png")
    print("📸 Final screenshot: /tmp/chatgpt-final.png")

print("\n🏁 Done!")
PY

echo ""
echo "✅ Image generation complete!"
