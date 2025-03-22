declare module 'lunr' {
  export interface Builder {
    ref(field: string): void;
    field(fieldName: string, options?: { boost?: number }): void;
    add(doc: any): void;
    build(): Index;
  }

  export interface Index {
    search(query: string): SearchResult[];
  }

  export interface SearchResult {
    ref: string;
    score: number;
    matchData: MatchData;
  }

  export interface MatchData {
    metadata: Record<string, Record<string, any>>;
  }

  export default function lunr(config: (this: Builder) => void): Index;
}
