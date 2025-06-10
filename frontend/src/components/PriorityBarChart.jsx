import { Bar } from 'react-chartjs-2';

export default function PriorityBarChart({ data, options }) {
  return (
    <div className="w-full h-72">
      <Bar data={data} options={options} />
    </div>
  );
}
