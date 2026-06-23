"""
solver_adapters — 求解器适配器工厂模式包

提供统一的工厂接口，根据问题类型和求解策略自动选择合适的求解器后端。
"""

from app.services.solver_adapters.base import BaseSolverAdapter
from app.services.solver_adapters.factory import SolverAdapterFactory
from app.services.solver_adapters.linear_mip_adapter import LinearMIPAdapter
from app.services.solver_adapters.cpsat_adapter import CPSATAdapter
from app.services.solver_adapters.sa_adapter import SimulatedAnnealingAdapter
from app.services.solver_adapters.ga_adapter import GeneticAlgorithmAdapter
from app.services.solver_adapters.ts_adapter import TabuSearchAdapter

__all__ = [
    "BaseSolverAdapter",
    "SolverAdapterFactory",
    "LinearMIPAdapter",
    "CPSATAdapter",
    "SimulatedAnnealingAdapter",
    "GeneticAlgorithmAdapter",
    "TabuSearchAdapter",
]
