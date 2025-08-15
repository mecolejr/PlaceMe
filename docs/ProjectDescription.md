# TruePlace: Project Description and Goals

TruePlace is a personalized relocation intelligence platform that computes compatibility scores for locations based on user profiles and public data (safety, demographics, legal protections, etc.). The mission: help people find places where they feel they belong, backed by facts.

## Goals
- Compute transparent, data-backed compatibility scores per location
- Personalize results using user identity, preferences, and priorities
- Visualize results with interactive maps and clear explanations
- Scale to U.S.-wide coverage and beyond with efficient data pipelines

## Initial Scope
- MVP scoring using basic safety and diversity data
- Minimal API to compute and return scores
- Simple front-end to input a profile and view results
- Documentation and issue log for continuous learning

## Tech Overview
- Backend: Node.js, Express, TypeScript, Prisma, PostgreSQL + PostGIS
- Frontend: React (Vite), with Leaflet/Mapbox for maps later
- Data: Scripts to import from FBI Crime Data, Census, etc.

## Transparency
Each score includes a breakdown and citations to data sources. Users can inspect how inputs affect results.
