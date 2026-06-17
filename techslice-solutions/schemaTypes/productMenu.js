export default {
  name: 'productMenu',
  title: 'Product Menu',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Menu Title',
      type: 'string',
      initialValue: 'Products'
    },
    {
      name: 'columns',
      title: 'Menu Columns',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'heading',
              title: 'Column Heading',
              type: 'string'
            },
            {
              name: 'items',
              title: 'Items',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    {
                      name: 'label',
                      title: 'Label',
                      type: 'string'
                    },
                    {
                      name: 'link',
                      title: 'URL',
                      type: 'url'
                    },
                    {
                      name: 'openInNewTab',
                      title: 'Open in new tab',
                      type: 'boolean',
                      initialValue: true
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}