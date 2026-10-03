package pl.comp.web;

import org.teavm.jso.JSExport;
import pl.comp.model.sudoku.BackTrackingSudokuSolver;
import pl.comp.model.sudoku.LevelDifficulty;
import pl.comp.model.sudoku.SudokuBoard;

// Browser entry point. TeaVM compiles this class, and the Model code it uses,
// to JavaScript; the @JSExport methods become functions the page can import.
public class SudokuWeb {
    private static SudokuBoard solution = new SudokuBoard();
    private static SudokuBoard sudoku = new SudokuBoard();

    public static void main(String[] args) {
    }

    // Same steps as GamingArena: solve an empty board, then blank cells by level (0 easy, 1 medium, 2 hard).
    @JSExport
    public static void newGame(int level) {
        solution = new SudokuBoard();
        new BackTrackingSudokuSolver().solve(solution);
        sudoku = copy(solution);
        new LevelDifficulty().selectLevel(sudoku, level);
    }

    @JSExport
    public static int get(int row, int col) {
        return sudoku.get(row, col);
    }

    @JSExport
    public static void set(int row, int col, int value) {
        sudoku.set(row, col, value);
    }

    // Same rule as GamingArena.validate: every cell must match the solution.
    @JSExport
    public static boolean isSolved() {
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                if (sudoku.get(i, j) != solution.get(i, j)) {
                    return false;
                }
            }
        }
        return true;
    }

    // Replaces the SQLite + Solution.dat save: board and solution as 162 digits, kept in localStorage by the page.
    @JSExport
    public static String save() {
        StringBuilder sb = new StringBuilder();
        for (SudokuBoard board : new SudokuBoard[] {sudoku, solution}) {
            for (int i = 0; i < 81; i++) {
                sb.append(board.get(i / 9, i % 9));
            }
        }
        return sb.toString();
    }

    @JSExport
    public static void load(String state) {
        sudoku = new SudokuBoard();
        solution = new SudokuBoard();
        for (int i = 0; i < 81; i++) {
            sudoku.set(i / 9, i % 9, state.charAt(i) - '0');
            solution.set(i / 9, i % 9, state.charAt(81 + i) - '0');
        }
    }

    // SudokuBoard.clone() goes through Java serialization, which has no browser equivalent.
    private static SudokuBoard copy(SudokuBoard from) {
        SudokuBoard to = new SudokuBoard();
        for (int i = 0; i < 81; i++) {
            to.set(i / 9, i % 9, from.get(i / 9, i % 9));
        }
        return to;
    }
}
