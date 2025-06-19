Feature: Ship and reticle interaction
  Scenario: Ship rotates toward pointer and reticle follows mouse
    Given I open the game page
    When I click the start screen
    Then the game should appear after a short delay
    When I move the pointer to offset 80 50
    Then the reticle should follow the pointer
    And the ship should face the reticle
