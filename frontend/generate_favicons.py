import os
from PIL import Image, ImageEnhance

def process_favicons():
    print("Initializing Favicon Processing Script...")
    
    public_dir = os.path.join(os.path.dirname(__file__), "public")
    os.makedirs(public_dir, exist_ok=True)
    
    # We expect the user to have dropped their logo image into public/favicon.png
    base_image_path = os.path.join(public_dir, "favicon.png")
    
    if not os.path.exists(base_image_path):
        print("ERROR: Could not find 'favicon.png' in the frontend/public folder.")
        print("Please save the image you provided into 'frontend/public/favicon.png' and rerun this script!")
        return
        
    print(f"Loaded base image: {base_image_path}")
    img = Image.open(base_image_path).convert("RGBA")
    
    # 1. Resize to 64x64 for standard favicon dimensions
    normal = img.resize((64, 64), Image.Resampling.LANCZOS)
    
    # Save as favicon-normal.png
    normal_path = os.path.join(public_dir, "favicon-normal.png")
    normal.save(normal_path)
    print(f"✅ Success: Generated Standard Favicon -> {normal_path}")
    
    # 2. Generate ALERT Version (Red emergency glow)
    # Split color channels
    r, g, b, a = normal.split()
    
    # Apply intense red tint to RGB channels
    r_tint = r.point(lambda p: min(255, int(p * 1.6)))
    g_tint = g.point(lambda p: int(p * 0.4))
    b_tint = b.point(lambda p: int(p * 0.4))
    
    alert = Image.merge("RGBA", (r_tint, g_tint, b_tint, a))
    
    # Boost brightness for a glowing effect
    enhancer = ImageEnhance.Brightness(alert)
    alert = enhancer.enhance(1.2)
    
    # Extract alpha channel to preserve transparency while making non-transparent pixels slightly more opaque if desired
    # For now, keeping alpha exactly the same is best for crisp edges
    
    alert_path = os.path.join(public_dir, "favicon-alert.png")
    alert.save(alert_path)
    print(f"✅ Success: Generated Emergency Alert Favicon -> {alert_path}")

if __name__ == "__main__":
    process_favicons()
