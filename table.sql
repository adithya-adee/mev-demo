CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    sentiment VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2),
    feedback VARCHAR(1000),
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create an index for faster queries
CREATE INDEX idx_feedback_sentiment ON feedback(sentiment);
CREATE INDEX idx_feedback_timestamp ON feedback(timestamp);