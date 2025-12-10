import { juejinArticlePublisher } from './platform/article/juejin.publisher';
import { csdnArticlePublisher } from './platform/article/csdn.publisher';
import { oschinaArticlePublisher } from './platform/article/oschina.publisher';
import { cnblogsArticlePublisher } from './platform/article/cnblogs.publisher';
import { segmentfaultArticlePublisher } from "./platform/article/segmentfault.publisher";
import { $51ctoArticlePublisher } from "./platform/article/51cto.publisher";


export const publisher = {
  article: {
    juejin: juejinArticlePublisher,
    csdn: csdnArticlePublisher,
    oschina: oschinaArticlePublisher,
    cnblogs: cnblogsArticlePublisher,
    segmentfault: segmentfaultArticlePublisher,
    $51cto: $51ctoArticlePublisher,
  },
  moment: {
   
  }
};

export const getPublisher = () => {
  return publisher;
};
