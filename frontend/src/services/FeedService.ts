import { CreateFeed, ListFeeds } from "../../wailsjs/go/main/App";
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
}
