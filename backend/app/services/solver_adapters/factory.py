"""
SolverAdapterFactory — 根据问题类型和求解策略创建对应的求解器适配器
"""

from app.services.solver_adapters.base import BaseSolverAdapter


class SolverAdapterFactory:
    """求解器适配器工厂类"""

    @staticmethod
    def create(problem_type: str, solving_strategy: str = "exact") -> BaseSolverAdapter:
        """根据问题类型和求解策略创建对应的求解器适配器

        Args:
            problem_type: 问题类型 ("LP", "MIP", "CP_SAT")
            solving_strategy: 求解策略 ("exact", "sa", "ga", "ts")
                仅 CP_SAT 类型支持元启发式策略

        Returns:
            对应的 BaseSolverAdapter 实例

        Raises:
            ValueError: 不支持的问题类型或求解策略
        """
        if problem_type in ("LP", "MIP"):
            from app.services.solver_adapters.linear_mip_adapter import LinearMIPAdapter
            return LinearMIPAdapter()
        elif problem_type == "CP_SAT":
            if solving_strategy == "sa":
                from app.services.solver_adapters.sa_adapter import SimulatedAnnealingAdapter
                return SimulatedAnnealingAdapter()
            elif solving_strategy == "ga":
                from app.services.solver_adapters.ga_adapter import GeneticAlgorithmAdapter
                return GeneticAlgorithmAdapter()
            elif solving_strategy == "ts":
                from app.services.solver_adapters.ts_adapter import TabuSearchAdapter
                return TabuSearchAdapter()
            else:  # "exact"
                from app.services.solver_adapters.cpsat_adapter import CPSATAdapter
                return CPSATAdapter()
        else:
            raise ValueError(f"Unsupported problem type: {problem_type}")
