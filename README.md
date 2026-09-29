# Meta Ads Data Connector

A Google Apps Script community connector that integrates the Meta Marketing API with Looker Studio for digital advertising analytics.

## Overview

I developed this project while working with a digital marketing startup to create a custom connection between Meta advertising data and Looker Studio. The connector retrieves advertising data from the Meta Marketing API and formats it for use in Looker Studio reports and visualizations.

Users provide their Meta access token and advertising account ID and can select a date range for the data they want to retrieve.

## Features

- Connects the Meta Marketing API to Looker Studio
- Retrieves campaign, ad set, and ad-level data
- Supports metrics including impressions, reach, clicks, spend, CPC, CPM, CTR, and ROAS
- Retrieves conversion data including purchases, leads, add-to-cart events, and registrations
- Supports user-selected date ranges
- Handles paginated responses from the Meta Marketing API
- Defines a custom data schema for use in Looker Studio

## Technologies

- JavaScript
- Google Apps Script
- Meta Marketing API
- Looker Studio

## How It Works

1. The user provides a Meta access token and advertising account ID through the connector configuration.
2. Looker Studio provides the requested fields and selected date range.
3. The connector requests the corresponding advertising data from the Meta Marketing API.
4. The API response is transformed into the format expected by Looker Studio.
5. The resulting data can be used to create reports and visualizations in Looker Studio.

## What I Learned

This project gave me experience working with an external API and developing a custom integration between two existing platforms. I also gained experience defining data schemas, processing API responses, handling pagination, and transforming advertising data for use in an analytics platform.

## Repository Structure

```text
apps-script-meta-ads-connector/
├── MetaAdsConnector.js
└── README.md
