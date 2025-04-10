import os
import sys
import json
import time
import base64
from dotenv import load_dotenv
import fal_client

# Load environment variables
load_dotenv()

# Check if FAL_KEY is set
FAL_KEY = os.getenv("FAL_KEY")
if not FAL_KEY:
    print("Error: FAL_KEY environment variable not set")
    sys.exit(1)

# Create image output directory if it doesn't exist
IMAGE_OUTPUT_DIR = os.getenv("IMAGE_OUTPUT_DIR", "../public/images/blog")
os.makedirs(IMAGE_OUTPUT_DIR, exist_ok=True)

def generate_image(prompt, output_filename):
    """
    Generate an image using fal-ai/flux/schnell model
    
    Args:
        prompt (str): The text prompt for image generation
        output_filename (str): The filename to save the image
    
    Returns:
        str: Path to the generated image
    """
    print(f"Generating image for prompt: {prompt}")
    
    try:
        # Define callback for progress updates
        def on_queue_update(update):
            if isinstance(update, fal_client.InProgress):
                for log in update.logs:
                    print(f"Progress: {log.get('message', '')}")
        
        # Submit the request to the model
        result = fal_client.subscribe(
            "fal-ai/flux/schnell",
            arguments={
                "prompt": prompt,
                "negative_prompt": "blurry, distorted, low quality, low resolution, bad anatomy, text, watermark"
            },
            with_logs=True,
            on_queue_update=on_queue_update,
        )
        
        # Check if the result contains the image data
        if "image" in result:
            # Save the image
            image_data = base64.b64decode(result["image"].split(",")[1])
            image_path = os.path.join(IMAGE_OUTPUT_DIR, output_filename)
            
            with open(image_path, "wb") as f:
                f.write(image_data)
            
            print(f"Image saved to {image_path}")
            return f"/images/blog/{output_filename}"
        else:
            print("Error: No image data in the result")
            print(f"Result: {result}")
            return None
    
    except Exception as e:
        print(f"Error generating image: {str(e)}")
        return None

if __name__ == "__main__":
    # Check if prompt is provided
    if len(sys.argv) < 3:
        print("Usage: python generate_image.py 'prompt' output_filename.jpg")
        sys.exit(1)
    
    prompt = sys.argv[1]
    output_filename = sys.argv[2]
    
    # Generate the image
    image_path = generate_image(prompt, output_filename)
    
    # Output the image path as JSON for the Node.js script to parse
    print(json.dumps({"image_path": image_path}))
