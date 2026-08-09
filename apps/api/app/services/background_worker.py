import asyncio
import logging
from app.core.config import settings
from app.services.cache_service import cache_service
from app.services.market_data_service import MarketDataService

logger = logging.getLogger("market_worker")


class MarketBackgroundWorker:
    """
    Python background worker that continuously refreshes market quotes
    in Redis / memory cache every 5 to 15 seconds to prevent hitting
    upstream API rate limits.
    """

    WATCHED_SYMBOLS = ["AAPL", "TSLA", "NVDA", "MSFT", "SPY", "RELIANCE.NS", "TCS.NS", "INFY.NS"]

    def __init__(self):
        self._is_running = False
        self._task: asyncio.Task | None = None

    async def _worker_loop(self):
        logger.info(f"Market Quote Background Worker started. Refresh interval: {settings.MARKET_REFRESH_INTERVAL_SECONDS}s.")
        while self._is_running:
            try:
                for symbol in self.WATCHED_SYMBOLS:
                    quote = MarketDataService.fetch_live_quote(symbol)
                    cache_key = f"market:quote:{symbol.upper()}"
                    await cache_service.set_json(cache_key, quote, ttl=settings.CACHE_TTL_SECONDS)

                logger.debug(f"Refreshed quotes for {len(self.WATCHED_SYMBOLS)} symbols in cache.")
            except Exception as e:
                logger.error(f"Error in background quote worker: {e}")

            await asyncio.sleep(settings.MARKET_REFRESH_INTERVAL_SECONDS)

    def start(self):
        """Starts the background quote refresh loop."""
        if not self._is_running:
            self._is_running = True
            self._task = asyncio.create_task(self._worker_loop())

    async def stop(self):
        """Stops the background worker task cleanly."""
        if self._is_running:
            self._is_running = False
            if self._task:
                self._task.cancel()
                try:
                    await self._task
                except asyncio.CancelledError:
                    pass
            logger.info("Market Quote Background Worker stopped.")


# Global Singleton Worker Instance
background_worker = MarketBackgroundWorker()
