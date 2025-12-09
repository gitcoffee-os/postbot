import { juejinArticlePublisher } from './platform/article/juejin.publisher';
import { csdnArticlePublisher } from './platform/article/csdn.publisher';
import { oschinaArticlePublisher } from './platform/article/oschina.publisher';

export const publisher = {
  article: {
    juejin: juejinArticlePublisher,
    csdn: csdnArticlePublisher,
    oschina: oschinaArticlePublisher,
  },
  moment: {
   
  }
};

export const getPublisher = () => {
  return publisher;
};
