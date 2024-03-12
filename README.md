# Automatic HTML Script Integrity Generator

This Node.js project automates the process of generating script integrity attributes (`integrity` and `crossorigin`) for HTML files and their associated assets. The integrity attribute ensures that the fetched resource has been delivered without manipulation, enhancing security by preventing script injection attacks.

## Requirements

- Node.js installed on your system.

## Usage

1. Clone or download this repository to your local machine.
2. Navigate to the project directory using the terminal.
3. Ensure your HTML files reside in the `test/src` directory.
4. Run the script by executing:
	```bash
	node app
	```

## Overview

The project scans the `test/src` directory for HTML files and extracts script and link assets. It then calculates the integrity hash for each asset and updates the HTML files with the corresponding integrity attributes.

## Customization

- Modify the `srcPath` and `distPath` variables to specify source and destination directories.
- Customize the regular expressions in `getAssets` to match specific asset patterns in your HTML files.

## Important

- Ensure that your HTML files reference assets using relative paths for accurate processing.
- Make sure your HTML files and assets are accessible and properly structured.

## Note

- This script assumes that assets are referenced using standard HTML `<script>` and `<link>` tags.
- It's recommended to review the generated HTML files to ensure correctness and compatibility.

Feel free to contribute to and improve this project! If you encounter any issues, please report them in the issue tracker.
