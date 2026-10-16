#!/bin/bash
# One bucket serves both brands: the app picks BookTube or NoTube from the hostname, and
# notube.nosocial.net is an alias of the same app.
aws s3 sync --delete . s3://booktube.nosocial.net/ \
  --exclude "*" \
  --include "index.html" \
  --include "styles.css" \
  --include "favicon.ico" \
  --include "booktube.js"
