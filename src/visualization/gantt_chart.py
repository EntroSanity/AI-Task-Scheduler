from datetime import datetime, timedelta
import plotly.figure_factory as ff

class GanttChartVisualizer:
    @staticmethod
    def create_chart(scheduled_tasks, output_file):
        df = []
        start_date = datetime(2023, 1, 1)  # Arbitrary start date
        for task in scheduled_tasks:
            df.append({
                'Task': task.id,
                'Start': start_date + timedelta(days=task.start_time),
                'Finish': start_date + timedelta(days=task.end_time),
                'Resource': ', '.join(task.required_resources)
            })
        
        fig = ff.create_gantt(df, index_col='Resource', show_colorbar=True, group_tasks=True)
        
        max_end_time = max(task.end_time for task in scheduled_tasks)
        fig.update_xaxes(
            tickformat='Day %d',
            tickvals=[start_date + timedelta(days=i) for i in range(0, int(max_end_time) + 1)],
            ticktext=[f'Day {i}' for i in range(0, int(max_end_time) + 1)]
        )
        
        fig.update_layout(
            title='Project Schedule Gantt Chart',
            xaxis_title='Project Timeline (Days)',
            yaxis_title='Tasks',
            height=400 + (len(scheduled_tasks) * 40),
            margin=dict(l=100, r=50, t=100, b=100)
        )
        
        fig.write_html(output_file)