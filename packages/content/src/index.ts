export interface ContentBoundary {
  readonly purpose: 'moderated-community-content';
  readonly implementedFeatures: readonly [];
}

export const contentBoundary: ContentBoundary = {
  purpose: 'moderated-community-content',
  implementedFeatures: []
};
