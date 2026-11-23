'use strict';

// Apply to existing posts as well as newly created posts, including cached ones.
hexo.extend.filter.register('template_locals', function (locals) {
  const { page } = locals;
  const isPost = page && (page.layout === 'post' ||
    (typeof page.source === 'string' && page.source.startsWith('_posts/')));

  if (isPost && page.toc == null) {
    page.toc = true;
  }

  return locals;
});
