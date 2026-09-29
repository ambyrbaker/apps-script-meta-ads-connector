/**
 * @fileoverview This script provides a Google Apps Script connector for the
 * Meta (Facebook) Marketing API, allowing data to be pulled into Looker Studio.
 * It handles configuration, schema definition, and data fetching/transformation
 * using a user-provided long-lived access token.
 */

// --- GLOBAL CONSTANTS ---
const META_API_VERSION = 'v23.0'; // UPDATED: Meta API version to v23.0, change whenever Meta updates version #
const cc = DataStudioApp.createCommunityConnector();

/**
 * Defines the authentication method for the connector.
 * Set to NONE as the user provides a long-lived access token in config.
 * @returns {Object} An authentication type response object.
 */
function getAuthType() {
  const cc = DataStudioApp.createCommunityConnector();
  return cc.newAuthTypeResponse()
    .setAuthType(cc.AuthType.NONE) // No specific authentication flow; token is provided in config.
    .build();
}

/**
 * Determines if the current user is an admin.
 * For this connector, we assume all users are admins for simplicity.
 * @returns {boolean} Always true.
 */
function isAdminUser() {
  return true;
}

/**
 * Defines the configuration parameters for the connector.
 * These parameters will be displayed in the Looker Studio UI when setting up the data source.
 * @returns {Object} A configuration response object.
 */
function getConfig() {
  const cc = DataStudioApp.createCommunityConnector();
  const config = cc.getConfig();

  config.newInfo()
    .setId('instructions')
    .setText('Enter your Meta long-lived access token and Ad Account ID to fetch campaign data.');

  config.newTextInput()
    .setId('access_token')
    .setName('Meta Long-Lived Access Token')
    .setHelpText('Paste your long-lived Meta API access token here. Ensure it has permissions for ads_read, ads_management, and read_insights.')
    .setPlaceholder('EAAB...');

  config.newTextInput()
    .setId('ad_account_id')
    .setName('Meta Ad Account ID')
    .setHelpText('Enter your Ad Account ID (e.g., act_123456789012345).')
    .setPlaceholder('act_YOUR_AD_ACCOUNT_ID');

  // It's crucial to set date range required to true for insights API.
  config.setDateRangeRequired(true);

  return config.build();
}

/**
 * Defines the schema (fields and their types) for the data returned by the connector.
 * This determines how data appears in Looker Studio.
 * @returns {Object} A fields object containing all defined dimensions and metrics.
 */
function getFields() {
  const cc = DataStudioApp.createCommunityConnector();
  const fields = cc.getFields();

  // Dimensions
  fields.newDimension()
    .setId('date_start')
    .setName('Start Date')
    .setType(cc.FieldType.TEXT);
  fields.newDimension()
    .setId('date_stop')
    .setName('End Date')
    .setType(cc.FieldType.TEXT);
  fields.newDimension()
    .setId('campaign_name')
    .setName('Campaign Name')
    .setType(cc.FieldType.TEXT);
  fields.newDimension()
    .setId('adset_name')
    .setName('Ad Set Name')
    .setType(cc.FieldType.TEXT);
  fields.newDimension()
    .setId('adset_id')
    .setName('Ad Set ID')
    .setType(cc.FieldType.TEXT);
  fields.newDimension()
    .setId('campaign_id')
    .setName('Campaign ID')
    .setType(cc.FieldType.TEXT);
  fields.newDimension()
    .setId('ad_id')
    .setName('Ad ID')
    .setType(cc.FieldType.TEXT);
  fields.newDimension()
    .setId('ad_name')
    .setName('Ad Name')
    .setType(cc.FieldType.TEXT);

  // Metrics
  fields.newMetric()
    .setId('impressions')
    .setName('Impressions')
    .setType(cc.FieldType.NUMBER)
    .setAggregation(cc.AggregationType.SUM);
  fields.newMetric()
    .setId('reach')
    .setName('Reach')
    .setType(cc.FieldType.NUMBER)
    .setAggregation(cc.AggregationType.SUM);
  fields.newMetric()
    .setId('clicks')
    .setName('Clicks')
    .setType(cc.FieldType.NUMBER)
    .setAggregation(cc.AggregationType.SUM);
  fields.newMetric()
    .setId('spend')
    .setName('Spend')
    .setType(cc.FieldType.NUMBER)
    .setAggregation(cc.AggregationType.SUM);
  fields.newMetric()
    .setId('cpc')
    .setName('Cost per Click')
    .setType(cc.FieldType.NUMBER)
    .setAggregation(cc.AggregationType.AVG);
  fields.newMetric()
    .setId('cpm')
    .setName('Cost per 1,000 Impressions')
    .setType(cc.FieldType.NUMBER)
    .setAggregation(cc.AggregationType.AVG);
  fields.newMetric()
    .setId('ctr')
    .setName('Click-Through Rate')
    .setType(cc.FieldType.NUMBER)
    .setAggregation(cc.AggregationType.AVG);
  fields.newMetric()
    .setId('frequency')
    .setName('Frequency')
    .setType(cc.FieldType.NUMBER)
    .setAggregation(cc.AggregationType.AVG);
  fields.newMetric()
    .setId('results')
    .setName('Results')
    .setType(cc.FieldType.NUMBER)
    .setAggregation(cc.AggregationType.SUM);
  fields.newMetric()
    .setId('cost_per_result')
    .setName('Cost per Result')
    .setType(cc.FieldType.NUMBER)
    .setAggregation(cc.AggregationType.AVG);
  fields.newMetric()
    .setId('purchase_roas')
    .setName('Purchase ROAS')
    .setType(cc.FieldType.NUMBER)
    .setAggregation(cc.AggregationType.AVG);
  fields.newMetric()
    .setId('website_purchase_roas')
    .setName('Website Purchase ROAS')
    .setType(cc.FieldType.NUMBER)
    .setAggregation(cc.AggregationType.AVG);
  fields.newMetric()
    .setId('inline_link_clicks')
    .setName('Inline Link Clicks')
    .setType(cc.FieldType.NUMBER)
    .setAggregation(cc.AggregationType.SUM);
  fields.newMetric()
    .setId('inline_link_click_ctr')
    .setName('Inline Link Click CTR')
    .setType(cc.FieldType.NUMBER)
    .setAggregation(cc.AggregationType.AVG);

  // Action-related metrics
  fields.newMetric()
    .setId('actions_purchase')
    .setName('Purchase Actions')
    .setType(cc.FieldType.NUMBER)
    .setAggregation(cc.AggregationType.SUM);
  fields.newMetric()
    .setId('action_values_purchase')
    .setName('Purchase Value')
    .setType(cc.FieldType.NUMBER)
    .setAggregation(cc.AggregationType.SUM);
  fields.newMetric()
    .setId('actions_add_to_cart')
    .setName('Add To Cart Actions')
    .setType(cc.FieldType.NUMBER)
    .setAggregation(cc.AggregationType.SUM);
  fields.newMetric()
    .setId('action_values_add_to_cart')
    .setName('Add To Cart Value')
    .setType(cc.FieldType.NUMBER)
    .setAggregation(cc.AggregationType.SUM);
  fields.newMetric()
    .setId('actions_lead')
    .setName('Lead Actions')
    .setType(cc.FieldType.NUMBER)
    .setAggregation(cc.AggregationType.SUM);
  fields.newMetric()
    .setId('action_values_lead')
    .setName('Lead Value')
    .setType(cc.FieldType.NUMBER)
    .setAggregation(cc.AggregationType.SUM);
  fields.newMetric()
    .setId('actions_view_content')
    .setName('View Content Actions')
    .setType(cc.FieldType.NUMBER)
    .setAggregation(cc.AggregationType.SUM);
  fields.newMetric()
    .setId('action_values_view_content')
    .setName('View Content Value')
    .setType(cc.FieldType.NUMBER)
    .setAggregation(cc.AggregationType.SUM);
  fields.newMetric()
    .setId('actions_initiate_checkout')
    .setName('Initiate Checkout Actions')
    .setType(cc.FieldType.NUMBER)
    .setAggregation(cc.AggregationType.SUM);
  fields.newMetric()
    .setId('action_values_initiate_checkout')
    .setName('Initiate Checkout Value')
    .setType(cc.FieldType.NUMBER)
    .setAggregation(cc.AggregationType.SUM);
  fields.newMetric()
    .setId('actions_complete_registration')
    .setName('Complete Registration Actions')
    .setType(cc.FieldType.NUMBER)
    .setAggregation(cc.AggregationType.SUM);
  fields.newMetric()
    .setId('action_values_complete_registration')
    .setName('Complete Registration Value')
    .setType(cc.FieldType.NUMBER)
    .setAggregation(cc.AggregationType.SUM);
  fields.newMetric()
    .setId('actions_subscribe')
    .setName('Subscribe Actions')
    .setType(cc.FieldType.NUMBER)
    .setAggregation(cc.AggregationType.SUM);
  fields.newMetric()
    .setId('action_values_subscribe')
    .setName('Subscribe Value')
    .setType(cc.FieldType.NUMBER)
    .setAggregation(cc.AggregationType.SUM);

  return fields;
}


/**
 * Returns the schema response for the connector.
 * @returns {Object} A schema response object.
 */
function getSchema() {
  const cc = DataStudioApp.createCommunityConnector();
  return cc.newGetSchemaResponse()
    .setFields(getFields())
    .build();
}

/**
 * Fetches data from the Meta Marketing API and returns it in a format
 * compatible with Looker Studio.
 * @param {Object} request The request object from Looker Studio, containing
 * config parameters, requested fields, and date range.
 * @returns {Object} A data response object.
 */
function getData(request) {
  const cc = DataStudioApp.createCommunityConnector();

  const requestedFieldIds = request.fields.map(field => field.name);
  const requestedFields = getFields().forIds(requestedFieldIds);

  const accessToken = request.configParams.access_token;
  let adAccountId = request.configParams.ad_account_id;

  if (!adAccountId.startsWith("act_")) {
    adAccountId = "act_" + adAccountId;
  }

  const fieldsParam = requestedFieldIds.join(',');
  const timeRange = encodeURIComponent(`{"since":"${request.dateRange.startDate}","until":"${request.dateRange.endDate}"}`);
  
  const url = `https://graph.facebook.com/v18.0/${adAccountId}/insights?fields=${fieldsParam}&access_token=${accessToken}&time_range=${timeRange}&level=ad&time_increment=1`;

  const response = UrlFetchApp.fetch(url);
  const parsed = JSON.parse(response.getContentText()).data;

  const rows = parsed.map(entry => {
    return requestedFieldIds.map(id => {
      const val = entry[id];
        if (typeof val === 'object') return null;
        return val ?? null;
      });
    });
  return cc.newGetDataResponse().setFields(requestedFields).addAllRows(rows).build();
}




/**
 * Transforms data from the Meta API response format to the Looker Studio schema format.
 * @param {Array<Object>} metaData An array of data objects from the Meta API.
 * @param {Object} requestedFields The fields object containing requested fields.
 * @returns {Array<Array>} An array of arrays, where each inner array is a row of data.
 */
function transformMetaResponseToRows(metaData, requestedFields) {
  const rows = [];
  const fieldIds = requestedFields.asArray().map(field => field.getId());

  metaData.forEach(metaRow => {
    const row = [];
    fieldIds.forEach(fieldId => {
      let value;
      switch (fieldId) {
        case 'date_start':
          value = metaRow.date_start ? metaRow.date_start.replace(/-/g, '') : ''; // YYYYMMDD format
          break;
        case 'date_stop':
          value = metaRow.date_stop ? metaRow.date_stop.replace(/-/g, '') : ''; // YYYYMMDD format
          break;
        case 'impressions':
        case 'reach':
        case 'clicks':
        case 'spend':
        case 'frequency':
        case 'results':
        case 'inline_link_clicks':
          value = parseFloat(metaRow[fieldId] || 0);
          break;
        case 'cpc':
        case 'cpm':
        case 'ctr':
        case 'cost_per_result':
        case 'purchase_roas':
        case 'website_purchase_roas':
        case 'inline_link_click_ctr':
          // These are calculated fields in getFields, so we just pass the raw numbers if available.
          // Looker Studio will calculate them based on the formula.
          // If Meta API provides them directly, use them. Otherwise, pass 0 or null.
          value = parseFloat(metaRow[fieldId] || 0);
          break;
        // Handle 'actions' and 'action_values' arrays
        case 'actions_purchase':
          value = getActionValue(metaRow.actions, 'purchase', 'action_count');
          break;
        case 'action_values_purchase':
          value = getActionValue(metaRow.action_values, 'purchase', 'value');
          break;
        case 'actions_add_to_cart':
          value = getActionValue(metaRow.actions, 'add_to_cart', 'action_count');
          break;
        case 'action_values_add_to_cart':
          value = getActionValue(metaRow.action_values, 'add_to_cart', 'value');
          break;
        case 'actions_lead':
          value = getActionValue(metaRow.actions, 'lead', 'action_count');
          break;
        case 'action_values_lead':
          value = getActionValue(metaRow.action_values, 'lead', 'value');
          break;
        case 'actions_view_content':
          value = getActionValue(metaRow.actions, 'view_content', 'action_count');
          break;
        case 'action_values_view_content':
          value = getActionValue(metaRow.action_values, 'view_content', 'value');
          break;
        case 'actions_initiate_checkout':
          value = getActionValue(metaRow.actions, 'initiate_checkout', 'action_count');
          break;
        case 'action_values_initiate_checkout':
          value = getActionValue(metaRow.action_values, 'initiate_checkout', 'value');
          break;
        case 'actions_complete_registration':
          value = getActionValue(metaRow.actions, 'complete_registration', 'action_count');
          break;
        case 'action_values_complete_registration':
          value = getActionValue(metaRow.action_values, 'complete_registration', 'value');
          break;
        case 'actions_subscribe':
          value = getActionValue(metaRow.actions, 'subscribe', 'action_count');
          break;
        case 'action_values_subscribe':
          value = getActionValue(metaRow.action_values, 'subscribe', 'value');
          break;
        default:
          // For other fields like campaign_name, adset_name, etc., get directly
          value = metaRow[fieldId] || null;
          break;
      }
      row.push(value);
    });
    rows.push(row);
  });
  return rows;
}

/**
 * Helper function to extract action count or value from Meta API 'actions' or 'action_values' arrays.
 * @param {Array<Object>} actionsArray The 'actions' or 'action_values' array from Meta API response.
 * @param {string} actionType The type of action (e.g., 'purchase', 'lead').
 * @param {string} propertyName The property to extract ('action_count' or 'value').
 * @returns {number} The extracted value, or 0 if not found.
 */
function getActionValue(actionsArray, actionType, propertyName) {
  if (!actionsArray || !Array.isArray(actionsArray)) {
    return 0;
  }
  const action = actionsArray.find(a => a.action_type === actionType);
  return action ? parseFloat(action[propertyName] || 0) : 0;
}

function fetchMetaApiData(accessToken, adAccountId, fields, startDate, endDate) {
  let allData = [];
  const timeRange = encodeURIComponent(`{"since":"${startDate}","until":"${endDate}"}`);
  let url = `https://graph.facebook.com/${META_API_VERSION}/${adAccountId}/insights?` +
    `fields=${fields.join(',')}` +
    `&time_range=${timeRange}` +
    `&level=ad&time_increment=1` +
    `&access_token=${accessToken}`;

  let hasNextPage = true;
  while (hasNextPage) {
    const options = {
      method: 'get',
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    const responseCode = response.getResponseCode();
    const responseBody = JSON.parse(response.getContentText());

    if (responseCode >= 200 && responseCode < 300) {
      if (responseBody.data) {
        allData = allData.concat(responseBody.data);
      }
      if (responseBody.paging && responseBody.paging.next) {
        url = responseBody.paging.next;
      } else {
        hasNextPage = false;
      }
    } else {
      const errorMessage = responseBody.error
        ? responseBody.error.message
        : 'Unknown error from Meta API.';
      throw new Error(`Meta API returned an error (${responseCode}): ${errorMessage}`);
    }
  }
  return allData;
}
