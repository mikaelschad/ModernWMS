using Moq;
using Xunit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ModernWMS.Backend.Controllers;
using ModernWMS.Backend.Models;
using ModernWMS.Backend.Repositories;

namespace ModernWMS.Tests.Controllers;

public class ItemControllerTests
{
    private readonly Mock<IItemRepository> _mockRepo;
    private readonly Mock<ILogger<ItemController>> _mockLogger;
    private readonly ItemController _controller;

    public ItemControllerTests()
    {
        _mockRepo = new Mock<IItemRepository>();
        _mockLogger = new Mock<ILogger<ItemController>>();
        _controller = new ItemController(_mockRepo.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task GetAll_ReturnsOkResult_WithListOfItems()
    {
        // Arrange
        var items = new List<Item> { new Item { SKU = "ITEM1" }, new Item { SKU = "ITEM2" } };
        _mockRepo.Setup(repo => repo.GetAllAsync()).ReturnsAsync(items);

        // Act
        var result = await _controller.GetAll();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnItems = Assert.IsAssignableFrom<IEnumerable<Item>>(okResult.Value);
        Assert.Equal(2, returnItems.Count());
    }

    [Fact]
    public async Task GetById_ReturnsOkResult_WhenItemExists()
    {
        // Arrange
        var item = new Item { SKU = "ITEM1" };
        _mockRepo.Setup(repo => repo.GetByIdAsync("ITEM1")).ReturnsAsync(item);

        // Act
        var result = await _controller.GetById("ITEM1");

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnItem = Assert.IsType<Item>(okResult.Value);
        Assert.Equal("ITEM1", returnItem.SKU);
    }

    [Fact]
    public async Task GetById_ReturnsNotFound_WhenItemDoesNotExist()
    {
        // Arrange
        _mockRepo.Setup(repo => repo.GetByIdAsync("ITEM1")).ReturnsAsync((Item?)null);

        // Act
        var result = await _controller.GetById("ITEM1");

        // Assert
        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task Create_ReturnsCreatedAtAction_WhenItemIsValid()
    {
        // Arrange
        var item = new Item { SKU = "ITEM1", Description = "Test Item" };
        _mockRepo.Setup(repo => repo.CreateAsync(item)).ReturnsAsync("ITEM1");

        // Act
        var result = await _controller.Create(item);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        Assert.Equal(nameof(ItemController.GetById), createdResult.ActionName);
        var returnItem = Assert.IsType<Item>(createdResult.Value);
        Assert.Equal("ITEM1", returnItem.SKU);
    }

    [Fact]
    public async Task Create_ReturnsBadRequest_WhenSkuIsMissing()
    {
        // Arrange
        var item = new Item { Description = "Test Item" }; // Missing SKU

        // Act
        var result = await _controller.Create(item);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Equal("SKU is required", badRequestResult.Value);
    }

    [Fact]
    public async Task Update_ReturnsNoContent_WhenUpdateIsSuccessful()
    {
        // Arrange
        var item = new Item { SKU = "ITEM1", Description = "Updated Item" };
        _mockRepo.Setup(repo => repo.UpdateAsync(item)).ReturnsAsync(true);

        // Act
        var result = await _controller.Update("ITEM1", item);

        // Assert
        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Update_ReturnsBadRequest_WhenSkuMismatch()
    {
        // Arrange
        var item = new Item { SKU = "ITEM2" };

        // Act
        var result = await _controller.Update("ITEM1", item);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("SKU mismatch", badRequestResult.Value);
    }

    [Fact]
    public async Task Update_ReturnsNotFound_WhenItemDoesNotExist()
    {
        // Arrange
        var item = new Item { SKU = "ITEM1" };
        _mockRepo.Setup(repo => repo.UpdateAsync(item)).ReturnsAsync(false);

        // Act
        var result = await _controller.Update("ITEM1", item);

        // Assert
        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task Delete_ReturnsNoContent_WhenDeleteIsSuccessful()
    {
        // Arrange
        _mockRepo.Setup(repo => repo.DeleteAsync("ITEM1")).ReturnsAsync(true);

        // Act
        var result = await _controller.Delete("ITEM1");

        // Assert
        Assert.IsType<NoContentResult>(result);
    }

    [Fact]
    public async Task Delete_ReturnsNotFound_WhenItemDoesNotExist()
    {
        // Arrange
        _mockRepo.Setup(repo => repo.DeleteAsync("ITEM1")).ReturnsAsync(false);

        // Act
        var result = await _controller.Delete("ITEM1");

        // Assert
        Assert.IsType<NotFoundResult>(result);
    }
}
