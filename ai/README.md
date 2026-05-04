---
title: MegiLance AI Service
emoji: 🚀
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
license: mit
---

# MegiLance Advanced AI Service

This is the AI backend for the MegiLance freelancing platform. It provides:

- **Chatbot**: Intelligent conversational agent using Mistral-7B
- **Matching**: Semantic matching of freelancers to projects
- **Price Estimation**: AI-powered project cost analysis
- **Sentiment Analysis**: For user feedback and messages
- **NER**: Named Entity Recognition for extracting skills and requirements

## Deployment

This service is designed to run on Hugging Face Spaces using the Docker SDK.

### Environment Variables

You should set the following secrets in your Space settings:

- `HF_API_TOKEN`: Your Hugging Face Access Token (read permission)
- `API_SECRET_KEY`: A secret key to secure the endpoints (optional but recommended)

## API Documentation

Once running, visit `/docs` to see the Swagger UI documentation.
