# Logo Formatter Tool

A web based tool to automatically crop, resize, and prepare logos according to preset brand requirements. Built for internal use, this tool simplifies logo formatting for branding configurations.

---

## Features

- Auto Crop: Detects visible logo bounds (non-transparent pixels) and crops out empty space.
- Aspect Ratio Handling:
  - Resizer 1: Square format (1:1) with fixed width
  - Resizer 2: Custom dimensions (e.g. 1170×730) with optional padding and border
- Live Preview: View results in real-time on a canvas grid background.
- Optional Padding & Border: Set pixel values, border color, and corner radius.
- Transparent Background Support
- Download Button: Export as PNG with one click.
- Preloaded Sample: Sample logo is preloaded to demonstrate functionality.

---

## Setup

Clone the repo and open the HTML file in your browser:

```bash
git clone https://github.com/your-username/logo-resizer-tool.git
cd logo-resizer-tool
open index.html  # or double-click the file
```


---

## Usage

1. Choose between Resizer 1 (Square) or Resizer 2 (Custom).
2. Upload your logo (`.png`, `.jpg`, or `.svg`).
3. Adjust width (and height for Resizer 2).
4. Optionally:

   * Add padding
   * Enable and customize a border
5. Click "Refresh Preview" to update changes.
6. Click "Download PNG" to save the processed image.

---

## Customization

### Preloaded Image

You can replace the sample image in:

```
images/logo.png
```
---

## Tech Stack

* HTML5 + CSS/SCSS
* Vanilla JavaScript 
* Canvas API for image processing

---


## License

This project is for internal use only, but feel free to fork and modify it for your own needs.

---

## Questions

For improvements or questions, feel free to open an issue or reach out directly.
