import type { Schema, Struct } from '@strapi/strapi';

export interface ProductAccordionItem extends Struct.ComponentSchema {
  collectionName: 'components_product_accordion_items';
  info: {
    description: 'A single accordion item with title and content';
    displayName: 'Accordion Item';
  };
  attributes: {
    content: Schema.Attribute.RichText & Schema.Attribute.Required;
    isExpanded: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
  };
}

export interface ProductProductTab extends Struct.ComponentSchema {
  collectionName: 'components_product_product_tabs';
  info: {
    description: 'A single product tab with title, content, and optional accordions';
    displayName: 'Product Tab';
  };
  attributes: {
    accordionItems: Schema.Attribute.Component<'product.accordion-item', true>;
    content: Schema.Attribute.RichText;
    displayType: Schema.Attribute.Enumeration<
      ['content_only', 'accordion_only', 'content_and_accordion']
    > &
      Schema.Attribute.DefaultTo<'accordion_only'>;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'product.accordion-item': ProductAccordionItem;
      'product.product-tab': ProductProductTab;
    }
  }
}
