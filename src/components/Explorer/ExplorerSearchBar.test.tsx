import { render, screen, fireEvent } from "@testing-library/react";
import { ExplorerSearchBar } from "./ExplorerSearchBar";

describe("ExplorerSearchBar", () => {
  test("calls onSearch with trimmed query", () => {
    const onSearch = jest.fn();
    render(<ExplorerSearchBar onSearch={onSearch} />);

    const input = screen.getByPlaceholderText(
      /Search by address/i
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: "  11111111111111111111111111111111  " } });
    fireEvent.submit(input.closest("form")!);

    expect(onSearch).toHaveBeenCalledWith("11111111111111111111111111111111");
  });
});
