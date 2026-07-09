import { HierarchyBreadcrumb } from './HierarchyBreadcrumb';

export default {
  title: 'Molecules/HierarchyBreadcrumb',
  component: HierarchyBreadcrumb,
};

export const Default = {
  args: {
    items: [
      { label: 'RapidAIM Growers Co.' },
      { label: 'Sierra Orchards' },
      { label: 'Block 4' },
    ],
  },
};

export const LongNames = {
  render: () => (
    <div style={{ width: 390 }}>
      <HierarchyBreadcrumb
        items={[
          { label: 'RapidAIM Growers Cooperative International West Coast Division' },
          { label: 'Sierra Orchards North Valley Experimental Ranch' },
          { label: 'Block 4 - Northeast Almond Trial Zone' },
        ]}
      />
    </div>
  ),
};
