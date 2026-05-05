from matplotlib.backends.backend_qtagg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.figure import Figure


class TrendChart(FigureCanvas):
    def __init__(self, title: str, labels: list[str], values: list[float]) -> None:
        fig = Figure(figsize=(4, 3), tight_layout=True)
        self.ax = fig.add_subplot(111)
        super().__init__(fig)
        self.ax.plot(labels, values, marker="o", color="#1f77b4")
        self.ax.set_title(title)
        self.ax.grid(alpha=0.3)
