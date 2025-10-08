import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: '시작하기',
      collapsed: false,
      items: [
        'getting-started/install-nodejs',
        'getting-started/create-project',
        'getting-started/how-react-works',
      ],
    },
    {
      type: 'category',
      label: 'React 기초',
      collapsed: false,
      items: [
        'react-basics/what-is-react',
        'react-basics/jsx',
        'react-basics/components-props',
        'react-basics/state-usestate',
        'react-basics/rendering',
        'react-basics/useeffect',
      ],
    },
    {
      type: 'category',
      label: 'React Hooks 심화',
      collapsed: false,
      items: [
        'react-hooks/useref',
        'react-hooks/usememo',
        'react-hooks/usecallback',
        'react-hooks/usecontext',
        'react-hooks/usereducer',
      ],
    },
    {
      type: 'category',
      label: 'React 실습',
      collapsed: false,
      items: [
        'react-practice/todo-app',
      ],
    },
  ],
};

export default sidebars;
