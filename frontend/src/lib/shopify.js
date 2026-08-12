const DOMAIN = process.env.REACT_APP_SHOPIFY_DOMAIN;
const TOKEN = process.env.REACT_APP_SHOPIFY_STOREFRONT_TOKEN;
const API_VERSION = process.env.REACT_APP_SHOPIFY_API_VERSION || "2025-01";

const PLACEHOLDER_DOMAIN = "your-store.myshopify.com";
const PLACEHOLDER_TOKEN = "replace-with-real-storefront-token";

export class ShopifyNotConfiguredError extends Error {
  constructor() {
    super("Shopify is not configured. Set REACT_APP_SHOPIFY_DOMAIN and REACT_APP_SHOPIFY_STOREFRONT_TOKEN.");
    this.name = "ShopifyNotConfiguredError";
  }
}

export function isShopifyConfigured() {
  return Boolean(
    DOMAIN && TOKEN && DOMAIN !== PLACEHOLDER_DOMAIN && TOKEN !== PLACEHOLDER_TOKEN
  );
}

async function storefrontFetch(query, variables = {}) {
  if (!isShopifyConfigured()) throw new ShopifyNotConfiguredError();
  const res = await fetch(`https://${DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Shopify Storefront API error: ${res.status}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join("; "));
  return json.data;
}

function normalizeProduct(node) {
  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description,
    image: node.images?.edges?.[0]?.node?.url || null,
    price: node.priceRange?.minVariantPrice
      ? { amount: node.priceRange.minVariantPrice.amount, currencyCode: node.priceRange.minVariantPrice.currencyCode }
      : null,
    variants: (node.variants?.edges || []).map((e) => ({
      id: e.node.id,
      title: e.node.title,
      availableForSale: e.node.availableForSale,
      price: { amount: e.node.price.amount, currencyCode: e.node.price.currencyCode },
    })),
  };
}

function normalizeCart(cart) {
  if (!cart) return null;
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    lines: (cart.lines?.edges || []).map((e) => ({
      id: e.node.id,
      quantity: e.node.quantity,
      merchandiseId: e.node.merchandise.id,
      title: e.node.merchandise.product?.title || e.node.merchandise.title,
      image: e.node.merchandise.image?.url || null,
      price: { amount: e.node.merchandise.price.amount, currencyCode: e.node.merchandise.price.currencyCode },
    })),
    cost: {
      totalAmount: {
        amount: cart.cost?.totalAmount?.amount,
        currencyCode: cart.cost?.totalAmount?.currencyCode,
      },
    },
  };
}

const PRODUCT_FIELDS = `
  id
  handle
  title
  description
  images(first: 1) {
    edges { node { url altText } }
  }
  priceRange {
    minVariantPrice { amount currencyCode }
  }
  variants(first: 25) {
    edges {
      node {
        id
        title
        availableForSale
        price { amount currencyCode }
      }
    }
  }
`;

const CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  cost {
    totalAmount { amount currencyCode }
  }
  lines(first: 50) {
    edges {
      node {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            price { amount currencyCode }
            image { url }
            product { title }
          }
        }
      }
    }
  }
`;

export async function getProducts({ first = 20 } = {}) {
  const data = await storefrontFetch(
    `query GetProducts($first: Int!) {
      products(first: $first) {
        edges { node { ${PRODUCT_FIELDS} } }
      }
    }`,
    { first }
  );
  return data.products.edges.map((e) => normalizeProduct(e.node));
}

export async function getProductByHandle(handle) {
  const data = await storefrontFetch(
    `query GetProduct($handle: String!) {
      productByHandle(handle: $handle) { ${PRODUCT_FIELDS} }
    }`,
    { handle }
  );
  return data.productByHandle ? normalizeProduct(data.productByHandle) : null;
}

export async function createCart(lines = []) {
  const data = await storefrontFetch(
    `mutation CreateCart($lines: [CartLineInput!]) {
      cartCreate(input: { lines: $lines }) {
        cart { ${CART_FIELDS} }
        userErrors { message }
      }
    }`,
    { lines }
  );
  if (data.cartCreate.userErrors?.length) {
    throw new Error(data.cartCreate.userErrors.map((e) => e.message).join("; "));
  }
  return normalizeCart(data.cartCreate.cart);
}

export async function addCartLines(cartId, lines) {
  const data = await storefrontFetch(
    `mutation AddCartLines($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ${CART_FIELDS} }
        userErrors { message }
      }
    }`,
    { cartId, lines }
  );
  if (data.cartLinesAdd.userErrors?.length) {
    throw new Error(data.cartLinesAdd.userErrors.map((e) => e.message).join("; "));
  }
  return normalizeCart(data.cartLinesAdd.cart);
}

export async function updateCartLines(cartId, lines) {
  const data = await storefrontFetch(
    `mutation UpdateCartLines($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { ${CART_FIELDS} }
        userErrors { message }
      }
    }`,
    { cartId, lines }
  );
  if (data.cartLinesUpdate.userErrors?.length) {
    throw new Error(data.cartLinesUpdate.userErrors.map((e) => e.message).join("; "));
  }
  return normalizeCart(data.cartLinesUpdate.cart);
}

export async function removeCartLines(cartId, lineIds) {
  const data = await storefrontFetch(
    `mutation RemoveCartLines($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart { ${CART_FIELDS} }
        userErrors { message }
      }
    }`,
    { cartId, lineIds }
  );
  if (data.cartLinesRemove.userErrors?.length) {
    throw new Error(data.cartLinesRemove.userErrors.map((e) => e.message).join("; "));
  }
  return normalizeCart(data.cartLinesRemove.cart);
}

export async function getCart(cartId) {
  const data = await storefrontFetch(
    `query GetCart($cartId: ID!) {
      cart(id: $cartId) { ${CART_FIELDS} }
    }`,
    { cartId }
  );
  return normalizeCart(data.cart);
}
