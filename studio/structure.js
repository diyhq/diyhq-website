// studio/structure.js
import { StructureBuilder } from 'sanity/desk'
import { MediaIcon } from '@sanity/icons'

export default () =>
  StructureBuilder.list()
    .title('Content')
    .items([
      StructureBuilder.documentTypeListItem('post').title('Post'),
      StructureBuilder.documentTypeListItem('category').title('Category'),
      StructureBuilder.listItem()
        .title('Media')
        .icon(MediaIcon)
        .child(
          StructureBuilder.component({
            component: () =>
              window.open('/wolf/wolf/media', '_blank') || null,
            name: 'media-link',
          })
        ),
    ])
