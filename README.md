# Tennis Match Predictor

A tennis match prediction system using Elo ratings to forecast match outcomes.

## Overview

This project builds an Elo rating system for ATP tennis players and uses it to predict match winners. The system calculates both overall and surface-specific (Hard, Clay, Grass) Elo ratings.

## Project Structure

- `data/processed/` - Processed match data and Elo ratings
  - `player_elo_ratings.csv` - Player Elo ratings (overall and by surface)
  - `atp_matches_2025.csv` - Validation dataset
  - `wimbledon_2025.csv` - Test dataset
  - `wimbledon_predictions.csv` - Generated predictions

- `notebooks/` - Jupyter notebooks for analysis
  - `01_elo_calculation.ipynb` - Elo rating calculation
  - `02_predictions.ipynb` - Match prediction and evaluation

## Features

- **Elo Rating System**: Calculates player ratings based on match history
- **Surface-Specific Ratings**: Separate Elo ratings for Hard, Clay, and Grass courts
- **Match Prediction**: Predicts winner and win probability for any matchup
- **Model Evaluation**: Accuracy metrics and confidence-level analysis

## How It Works

1. Historical match data is processed to calculate Elo ratings for each player
2. Ratings are updated after each match using the standard Elo formula
3. Match predictions are made by comparing player Elo ratings
4. Win probability is calculated using: `1 / (1 + 10^((Elo2 - Elo1) / 400))`

## Results

The model is evaluated on:
- **Validation Set**: ATP 2025 matches
- **Test Set**: Wimbledon 2025 matches (using both overall and grass-specific Elo)

## Future Improvements

<!-- Add your planned improvements here -->

