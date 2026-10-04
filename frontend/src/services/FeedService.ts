import {
  CreateFeed,
  FetchRemoteArticles,
  GetFeedById,
  GetStoredArticles,
  ListFeeds,
} from "../../wailsjs/go/main/App";
import { feed } from "../../wailsjs/go/models";

export class FeedService {
  public static CreateFeed(options: {
    title: string;
    url: string;
  }): Promise<feed.Feed> {
    return CreateFeed(options.title, options.url);
  }

  public static ListFeeds(): Promise<feed.Feed[]> {
    return ListFeeds();
  }

  public static GetFeedById(id: number): Promise<feed.Feed> {
    return GetFeedById(id);
  }

  public static GetStoredArticlesOfFeed(feedId: number) {
    return GetStoredArticles(feedId);
  }

  public static FetchRemoteArticlesOfFeed(feedId: number) {
    return FetchRemoteArticles(feedId);
  }
}
