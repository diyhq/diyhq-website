// /studio/structure/deskStructure.js
export default (S) =>
  S.list()
    .title('DIY HQ Content')
    .items([
      S.documentTypeListItem('post').title('Posts'),
      S.documentTypeListItem('category').title('Categories'),
      S.divider(),
    ])
