-- Short Link Table
CREATE TABLE IF NOT EXISTS short_links (
    id BIGINT PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    description TEXT,
    visit_count BIGINT DEFAULT 0,
    created_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_short_links_created_by ON short_links(created_by);
CREATE INDEX idx_short_links_slug ON short_links(slug);
