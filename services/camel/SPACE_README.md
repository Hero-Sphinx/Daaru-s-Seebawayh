---
title: Daaru-s-Seebawayh CAMeL
emoji: 📚
colorFrom: green
colorTo: yellow
sdk: docker
app_port: 8001
pinned: false
---

# CAMeL Tools morphology service

The Arabic morphological analyzer behind Daaru-s-Seebawayh (root, lemma,
part of speech and features for a word). Built from the Dockerfile in this
Space; the web app calls `POST /analyze` and `GET /health`.

(When uploading to a Hugging Face Space, this file is uploaded as `README.md`
— the block at the top is the Space's configuration.)
