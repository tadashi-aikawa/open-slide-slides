import type { OpenSlideConfig } from '@open-slide/core';

const playerOnly = process.env.OPEN_SLIDE_PLAYER_ONLY === '1';

const openSlideConfig: OpenSlideConfig = {
  base: process.env.OPEN_SLIDE_BASE ?? '/',
  build: playerOnly ? { showSlideBrowser: false, showSlideUi: false } : undefined,
};

export default openSlideConfig;
