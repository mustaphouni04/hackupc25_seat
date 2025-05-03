import fitz  
import os

def extract_images_and_text(pdf_path, output_dir):
    os.makedirs(output_dir, exist_ok=True)

    doc = fitz.open(pdf_path)

    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text()
        text_path = os.path.join(output_dir, f"page_{page_num+1}_text.txt")

        with open(text_path, "w", encoding="utf-8") as f:
            f.write(text)

        for img_index, img in enumerate(page.get_images(full=True)):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            image_filename = f"page_{page_num+1}_img_{img_index+1}.{image_ext}"
            image_path = os.path.join(output_dir, image_filename)

            with open(image_path, "wb") as img_file:
                img_file.write(image_bytes)

    doc.close()
    print(f"Extraction complete. Output saved to: {output_dir}")

extract_images_and_text("../CUPRA_Tavascan_Owners_Manual_11_24_GB.pdf","./images")


