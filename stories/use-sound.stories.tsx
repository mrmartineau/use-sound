import 'focus-visible';
import React from 'react';
import CheckboxDemo from './demos/Checkbox';
import DrumMachineDemo from './demos/DrumMachine';
import HoverDemo from './demos/Hover';
import RisingDemo from './demos/Rising';
import ShowWhilePlayingDemo from './demos/ShowWhilePlaying';
import SimpleDemo from './demos/Simple';
import MultipleSourcesDemo from './demos/SimpleMultipleSources';
import Wrapper from './helpers/Wrapper';

const meta = {
  title: 'useSound',
  decorators: [
    Story =>
      React.createElement(
        Wrapper,
        null,
        React.createElement(Story, null)
      ),
  ],
};

export default meta;

export const Simple = {
  name: 'Default',
  render: () => React.createElement(SimpleDemo),
};

export const Checkbox = {
  name: 'Checkbox',
  render: () => (
    <div style={{ display: 'flex', width: 160, justifyContent: 'space-between' }}>
      <CheckboxDemo />
    </div>
  ),
};

export const Hovering = {
  name: 'Play when hovering',
  render: () => React.createElement(HoverDemo),
};

export const Rising = {
  name: 'Rising pitch',
  render: () => React.createElement(RisingDemo),
};

export const DrumMachine = {
  name: 'Drum machine (sprites)',
  render: () => React.createElement(DrumMachineDemo),
};

export const MultipleSources = {
  name: 'Multiple sources support',
  args: {
    order: 'wav_mp3',
  },
  argTypes: {
    order: {
      control: { type: 'inline-radio' },
      options: ['wav_mp3', 'mp3_wav'],
      description: 'Source priority order for supported formats',
      table: {
        type: { summary: "'wav_mp3' | 'mp3_wav'" },
      },
    },
  },
  render: ({ order }) => React.createElement(MultipleSourcesDemo, { order }),
};

export const ShowWhilePlaying = {
  name: 'With Howler events (show while playing)',
  render: () => React.createElement(ShowWhilePlayingDemo),
};
