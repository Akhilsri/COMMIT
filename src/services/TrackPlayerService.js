// services/TrackPlayerService.js
import TrackPlayer, { Event } from 'react-native-track-player';

module.exports = async function() {
  // This service needs to be registered for the module to work
  // but we will register the events handlers separately
  
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());
  TrackPlayer.addEventListener(Event.RemoteSeek, ({ position }) => TrackPlayer.seekTo(position));
  
  // You can handle other events here if needed
  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async (data) => {
    // You can decide what to do when the queue ends
    // For example, repeat the current track
    await TrackPlayer.seekTo(0);
    await TrackPlayer.play();
  });
};