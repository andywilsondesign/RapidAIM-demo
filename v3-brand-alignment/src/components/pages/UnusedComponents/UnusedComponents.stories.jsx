import React from 'react';
import { Alert } from '../../molecules/Alert/Alert';
import { SegmentedControl } from '../../molecules/SegmentedControl/SegmentedControl';
import { HeroMetricsRow } from '../../organisms/HeroMetricsRow/HeroMetricsRow';
import { AccountForm } from '../../organisms/AccountForm/AccountForm';

export default {
  title: 'Pages/Unused Components Review',
  parameters: {
    layout: 'padded',
  },
};

export const UnusedComponentsList = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px', margin: '0 auto' }}>
      <section>
        <h2 style={{ marginBottom: '16px', fontFamily: 'Arial, sans-serif' }}>Alert Molecule</h2>
        <Alert title="Sample Alert" message="This is what the Alert component looks like." type="warning" />
      </section>

      <section>
        <h2 style={{ marginBottom: '16px', fontFamily: 'Arial, sans-serif' }}>Segmented Control</h2>
        <SegmentedControl options={[{ label: 'Option A', value: 'a' }, { label: 'Option B', value: 'b' }]} value="a" onChange={() => {}} />
      </section>

      <section>
        <h2 style={{ marginBottom: '16px', fontFamily: 'Arial, sans-serif' }}>Hero Metrics Row</h2>
        <HeroMetricsRow />
      </section>

      <section>
        <h2 style={{ marginBottom: '16px', fontFamily: 'Arial, sans-serif' }}>Account Form</h2>
        <AccountForm />
      </section>
    </div>
  ),
};
