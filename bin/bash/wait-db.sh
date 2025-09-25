## Get absolute path to the .env.test file
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_PATH="$SCRIPT_DIR/../../.env.test"

# Load environment variables from .env file
set -o allexport
source "$ENV_PATH"
set +o allexport

# Use variables from the .env file
HOST=${POSTGRES_HOST}
PORT=${POSTGRES_PORT}
USER=${POSTGRES_USER}
MAX_ATTEMPTS=30

echo "Waiting for PostgreSQL at $HOST:$PORT..."

for ((i=1; i<=MAX_ATTEMPTS; i++)); do
  pg_isready -h "$HOST" -p "$PORT" -U "$USER"
  if [ $? -eq 0 ]; then
    echo "Database is ready!"
    exit 0
  fi
  sleep 1
done

echo "Database not available after $MAX_ATTEMPTS attempts."
exit 1
