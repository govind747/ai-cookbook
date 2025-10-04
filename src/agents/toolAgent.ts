import type { ToolResponse } from '../types';

export const toolAgent = async (
  toolName: string,
  params: Record<string, any>
): Promise<ToolResponse> => {
  try {
    switch (toolName) {
      case 'weather':
        return await getWeather(params.location);

      case 'crypto':
        return await getCryptoPrice(params.symbol);

      case 'calculator':
        return await calculate(params.expression);

      case 'datetime':
        return await getDateTime(params.timezone);

      case 'exchange':
        return await getExchangeRate(params.from, params.to);

      default:
        return {
          success: false,
          error: `Unknown tool: ${toolName}`,
        };
    }
  } catch (error: any) {
    console.error('Tool Agent Error:', error);
    return {
      success: false,
      error: error.message || 'Tool execution failed',
    };
  }
};

const getWeather = async (location: string): Promise<ToolResponse> => {
  try {
    if (!location) {
      throw new Error('Location is required');
    }

    const response = await fetch(
      `https://wttr.in/${encodeURIComponent(location)}?format=j1`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const data = await response.json();
    const current = data.current_condition[0];

    return {
      success: true,
      data: {
        location,
        temperature: `${current.temp_C}°C`,
        condition: current.weatherDesc[0].value,
        humidity: `${current.humidity}%`,
        windSpeed: `${current.windspeedKmph} km/h`,
        feelsLike: `${current.FeelsLikeC}°C`,
      },
    };
  } catch (error: any) {
    console.error('Weather Tool Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get weather information',
    };
  }
};

const getCryptoPrice = async (symbol: string): Promise<ToolResponse> => {
  try {
    if (!symbol) {
      throw new Error('Cryptocurrency symbol is required');
    }

    const normalizedSymbol = symbol.toUpperCase();

    const response = await fetch(
      `https://api.coinbase.com/v2/prices/${normalizedSymbol}-USD/spot`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch cryptocurrency price');
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        symbol: normalizedSymbol,
        price: `$${parseFloat(data.data.amount).toFixed(2)}`,
        currency: data.data.currency,
      },
    };
  } catch (error: any) {
    console.error('Crypto Tool Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get cryptocurrency price',
    };
  }
};

const calculate = async (expression: string): Promise<ToolResponse> => {
  try {
    if (!expression) {
      throw new Error('Expression is required');
    }

    const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');

    const result = Function(`"use strict"; return (${sanitized})`)();

    return {
      success: true,
      data: {
        expression: sanitized,
        result,
      },
    };
  } catch (error: any) {
    console.error('Calculator Tool Error:', error);
    return {
      success: false,
      error: 'Invalid mathematical expression',
    };
  }
};

const getDateTime = async (timezone?: string): Promise<ToolResponse> => {
  try {
    const now = new Date();

    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone || undefined,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    };

    const formatted = now.toLocaleString('en-US', options);

    return {
      success: true,
      data: {
        timestamp: now.toISOString(),
        formatted,
        timezone: timezone || 'Local',
      },
    };
  } catch (error: any) {
    console.error('DateTime Tool Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get date/time information',
    };
  }
};

const getExchangeRate = async (
  from: string,
  to: string
): Promise<ToolResponse> => {
  try {
    if (!from || !to) {
      throw new Error('Both from and to currencies are required');
    }

    const fromUpper = from.toUpperCase();
    const toUpper = to.toUpperCase();

    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${fromUpper}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate');
    }

    const data = await response.json();

    if (!(toUpper in data.rates)) {
      throw new Error(`Invalid currency code: ${toUpper}`);
    }

    const rate = data.rates[toUpper];

    return {
      success: true,
      data: {
        from: fromUpper,
        to: toUpper,
        rate,
        example: `1 ${fromUpper} = ${rate.toFixed(4)} ${toUpper}`,
      },
    };
  } catch (error: any) {
    console.error('Exchange Rate Tool Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get exchange rate',
    };
  }
};

export const listAvailableTools = (): string[] => {
  return ['weather', 'crypto', 'calculator', 'datetime', 'exchange'];
};

export const getToolDescription = (
  toolName: string
): { name: string; description: string; params: string[] } | null => {
  const tools: Record<
    string,
    { name: string; description: string; params: string[] }
  > = {
    weather: {
      name: 'Weather',
      description: 'Get current weather information for any location',
      params: ['location'],
    },
    crypto: {
      name: 'Cryptocurrency Price',
      description: 'Get current price of a cryptocurrency',
      params: ['symbol'],
    },
    calculator: {
      name: 'Calculator',
      description: 'Evaluate mathematical expressions',
      params: ['expression'],
    },
    datetime: {
      name: 'Date & Time',
      description: 'Get current date and time for any timezone',
      params: ['timezone (optional)'],
    },
    exchange: {
      name: 'Exchange Rate',
      description: 'Get exchange rate between two currencies',
      params: ['from', 'to'],
    },
  };

  return tools[toolName] || null;
};
